import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { badRequest, conflict, notFound } from '../middleware/error.js'
import { emitEvent } from '../lib/realtime.js'
import { notify } from '../lib/notify.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

// R2: a vehicle is only dispatchable when Available (never Retired / In Shop / already On Trip).
function vehicleBlockReason(v) {
  if (v.status === 'Retired') return 'Retired'
  if (v.status === 'InShop') return 'In maintenance'
  if (v.status === 'OnTrip') return 'Already on a trip'
  return null
}

// R3 + R4: a driver must be Available with a valid (non-expired) licence.
function driverBlockReason(d) {
  if (d.status === 'Suspended') return 'Suspended'
  if (d.status === 'OnTrip') return 'Already on a trip'
  if (d.status === 'OffDuty') return 'Off duty'
  if (new Date(d.licenseExpiry) < new Date()) return 'Licence expired'
  return null
}

const createSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeightKg: z.coerce.number().int().positive(),
  plannedDistanceKm: z.coerce.number().positive(),
  dispatch: z.boolean().optional().default(false),
})

const completeSchema = z.object({
  finalOdometer: z.coerce.number().int().nonnegative().optional(),
  fuelConsumed: z.coerce.number().nonnegative().optional(),
  fuelPrice: z.coerce.number().nonnegative().optional(),
  revenue: z.coerce.number().nonnegative().optional(),
})

const canWrite = requireRole(ROLES.FLEET_MANAGER, ROLES.DISPATCHER)

async function nextTripCode(isDemo) {
  const count = await prisma.trip.count({ where: { isDemo } })
  return `TRIP-${String(count + 1).padStart(4, '0')}`
}

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query
    const trips = await prisma.trip.findMany({
      where: { isDemo: req.isDemo, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, driver: true },
    })
    res.json(trips)
  } catch (err) {
    next(err)
  }
})

// Powers the dispatch form: every vehicle/driver annotated with eligibility + reason.
router.get('/options', async (req, res, next) => {
  try {
    const [vehicles, drivers] = await Promise.all([
      prisma.vehicle.findMany({ where: { isDemo: req.isDemo }, orderBy: { regNumber: 'asc' } }),
      prisma.driver.findMany({ where: { isDemo: req.isDemo }, orderBy: { name: 'asc' } }),
    ])
    res.json({
      vehicles: vehicles.map((v) => {
        const reason = vehicleBlockReason(v)
        return { id: v.id, label: `${v.regNumber} · ${v.name}`, maxLoadKg: v.maxLoadKg, eligible: !reason, reason }
      }),
      drivers: drivers.map((d) => {
        const reason = driverBlockReason(d)
        return { id: d.id, label: `${d.name} · ${d.licenseNumber}`, eligible: !reason, reason }
      }),
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, isDemo: req.isDemo },
      include: { vehicle: true, driver: true },
    })
    if (!trip) throw notFound('Trip not found')
    res.json(trip)
  } catch (err) {
    next(err)
  }
})

router.post('/', canWrite, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findFirst({ where: { id: data.vehicleId, isDemo: req.isDemo } }),
      prisma.driver.findFirst({ where: { id: data.driverId, isDemo: req.isDemo } }),
    ])
    if (!vehicle || !driver) throw notFound('Vehicle or driver not found')

    // R5: cargo must never exceed the vehicle's capacity.
    if (data.cargoWeightKg > vehicle.maxLoadKg) {
      throw badRequest(`Cargo ${data.cargoWeightKg}kg exceeds ${vehicle.regNumber} capacity (${vehicle.maxLoadKg}kg)`)
    }

    const code = await nextTripCode(req.isDemo)
    const base = {
      code,
      isDemo: req.isDemo,
      source: data.source,
      destination: data.destination,
      cargoWeightKg: data.cargoWeightKg,
      plannedDistanceKm: data.plannedDistanceKm,
      vehicleId: vehicle.id,
      driverId: driver.id,
    }

    if (!data.dispatch) {
      const trip = await prisma.trip.create({ data: { ...base, status: 'Draft' } })
      emitEvent('trips:changed', { id: trip.id })
      return res.status(201).json(trip)
    }

    // Dispatching: enforce R2/R3/R4, then flip both to On Trip (R6) in one transaction.
    const vReason = vehicleBlockReason(vehicle)
    const dReason = driverBlockReason(driver)
    if (vReason || dReason) {
      const parts = []
      if (vReason) parts.push(`${vehicle.regNumber}: ${vReason}`)
      if (dReason) parts.push(`${driver.name}: ${dReason}`)
      throw conflict(`Cannot dispatch — ${parts.join('; ')}`)
    }

    const [trip] = await prisma.$transaction([
      prisma.trip.create({ data: { ...base, status: 'Dispatched', dispatchedAt: new Date() } }),
      prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'OnTrip' } }),
      prisma.driver.update({ where: { id: driver.id }, data: { status: 'OnTrip' } }),
    ])
    emitEvent('trips:changed', { id: trip.id })
    await notify('trip', `${trip.code} dispatched: ${trip.source} → ${trip.destination}`, req.isDemo)
    res.status(201).json(trip)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/dispatch', canWrite, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, isDemo: req.isDemo }, include: { vehicle: true, driver: true } })
    if (!trip) throw notFound('Trip not found')
    if (trip.status !== 'Draft') throw badRequest('Only draft trips can be dispatched')

    const vReason = vehicleBlockReason(trip.vehicle)
    const dReason = driverBlockReason(trip.driver)
    if (vReason || dReason) {
      const parts = []
      if (vReason) parts.push(`${trip.vehicle.regNumber}: ${vReason}`)
      if (dReason) parts.push(`${trip.driver.name}: ${dReason}`)
      throw conflict(`Cannot dispatch — ${parts.join('; ')}`)
    }

    await prisma.$transaction([
      prisma.trip.update({ where: { id: trip.id }, data: { status: 'Dispatched', dispatchedAt: new Date() } }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'OnTrip' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'OnTrip' } }),
    ])
    emitEvent('trips:changed', { id: trip.id })
    await notify('trip', `${trip.code} dispatched: ${trip.source} → ${trip.destination}`, req.isDemo)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// R7: completing restores vehicle + driver to Available and updates the odometer.
router.post('/:id/complete', canWrite, async (req, res, next) => {
  try {
    const { fuelPrice, ...data } = completeSchema.parse(req.body)
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, isDemo: req.isDemo } })
    if (!trip) throw notFound('Trip not found')
    if (trip.status !== 'Dispatched') throw badRequest('Only dispatched trips can be completed')

    const ops = [
      prisma.trip.update({ where: { id: trip.id }, data: { status: 'Completed', completedAt: new Date(), ...data } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'Available', ...(data.finalOdometer ? { odometer: data.finalOdometer } : {}) },
      }),
    ]

    // Automation: a completed trip's fuel is logged straight into the fuel ledger.
    // Price uses the rate entered at completion, else a default of ₹100/L — no manual re-entry.
    if (data.fuelConsumed > 0) {
      const price = fuelPrice ?? 100
      ops.push(
        prisma.fuelLog.create({
          data: {
            liters: data.fuelConsumed,
            cost: Number((data.fuelConsumed * price).toFixed(2)),
            note: `Auto-logged from ${trip.code}`,
            tripId: trip.id,
            vehicleId: trip.vehicleId,
            isDemo: req.isDemo,
          },
        }),
      )
    }

    await prisma.$transaction(ops)
    emitEvent('trips:changed', { id: trip.id })
    emitEvent('finance:changed', { tripId: trip.id })
    await notify('trip', `${trip.code} completed`, req.isDemo)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// R8: cancelling a dispatched trip restores both to Available.
router.post('/:id/cancel', canWrite, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, isDemo: req.isDemo } })
    if (!trip) throw notFound('Trip not found')
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      throw badRequest('This trip is already finished')
    }

    const ops = [prisma.trip.update({ where: { id: trip.id }, data: { status: 'Cancelled' } })]
    if (trip.status === 'Dispatched') {
      ops.push(prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } }))
      ops.push(prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } }))
    }
    await prisma.$transaction(ops)
    emitEvent('trips:changed', { id: trip.id })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
