import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { badRequest, notFound } from '../middleware/error.js'
import { emitEvent } from '../lib/realtime.js'
import { notify } from '../lib/notify.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

const createSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().min(2),
  description: z.string().optional().nullable(),
  cost: z.coerce.number().nonnegative().default(0),
})

const canWrite = requireRole(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER)

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query
    const records = await prisma.maintenance.findMany({
      where: { isDemo: req.isDemo, ...(status ? { status } : {}) },
      orderBy: { openedAt: 'desc' },
      include: { vehicle: true },
    })
    res.json(records)
  } catch (err) {
    next(err)
  }
})

// R9: opening an active maintenance record moves the vehicle to In Shop.
router.post('/', canWrite, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const vehicle = await prisma.vehicle.findFirst({ where: { id: data.vehicleId, isDemo: req.isDemo } })
    if (!vehicle) throw notFound('Vehicle not found')
    if (vehicle.status === 'OnTrip') throw badRequest('This vehicle is on a trip — complete the trip first')
    if (vehicle.status === 'Retired') throw badRequest('Retired vehicles cannot be serviced')

    const [record] = await prisma.$transaction([
      prisma.maintenance.create({ data: { ...data, status: 'Active', isDemo: req.isDemo } }),
      prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'InShop' } }),
    ])
    emitEvent('maintenance:changed', { id: record.id })
    await notify('maintenance', `${vehicle.regNumber} moved to In Shop — ${data.type}`, req.isDemo)
    res.status(201).json(record)
  } catch (err) {
    next(err)
  }
})

// R10: closing restores the vehicle to Available — unless it is Retired or still has other open work.
router.post('/:id/close', canWrite, async (req, res, next) => {
  try {
    const record = await prisma.maintenance.findFirst({ where: { id: req.params.id, isDemo: req.isDemo }, include: { vehicle: true } })
    if (!record) throw notFound('Maintenance record not found')
    if (record.status === 'Closed') throw badRequest('This record is already closed')

    const otherOpen = await prisma.maintenance.count({
      where: { vehicleId: record.vehicleId, status: 'Active', id: { not: record.id } },
    })

    const ops = [prisma.maintenance.update({ where: { id: record.id }, data: { status: 'Closed', closedAt: new Date() } })]
    if (otherOpen === 0 && record.vehicle.status !== 'Retired') {
      ops.push(prisma.vehicle.update({ where: { id: record.vehicleId }, data: { status: 'Available' } }))
    }
    await prisma.$transaction(ops)
    emitEvent('maintenance:changed', { id: record.id })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
