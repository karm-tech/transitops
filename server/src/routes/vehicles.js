import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { conflict, notFound } from '../middleware/error.js'
import { emitEvent } from '../lib/realtime.js'
import { ROLES, VEHICLE_STATUS } from '../lib/constants.js'

const router = Router()

// Type is free-form (custom types allowed); statuses stay fixed as they drive the rules engine.
const vehicleSchema = z.object({
  regNumber: z.string().min(3, 'must be at least 3 characters (e.g. GJ01-VAN-05)').transform((v) => v.trim().toUpperCase()),
  name: z.string().min(2, 'must be at least 2 characters'),
  type: z.string().min(2, 'please choose a type'),
  maxLoadKg: z.coerce.number({ invalid_type_error: 'must be a number' }).int('must be a whole number').positive('must be greater than 0'),
  odometer: z.coerce.number({ invalid_type_error: 'must be a number' }).int('must be a whole number').nonnegative('cannot be negative').default(0),
  acquisitionCost: z.coerce.number({ invalid_type_error: 'must be a number' }).nonnegative('cannot be negative').default(0),
  region: z.string().optional().nullable(),
  status: z.enum(VEHICLE_STATUS).default('Available'),
})

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { search, status, type, sort = 'createdAt' } = req.query
    const where = {
      isDemo: req.isDemo,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { regNumber: { contains: String(search) } },
              { name: { contains: String(search) } },
            ],
          }
        : {}),
    }
    const orderBy = ['regNumber', 'odometer', 'acquisitionCost', 'createdAt'].includes(String(sort))
      ? { [String(sort)]: sort === 'createdAt' ? 'desc' : 'asc' }
      : { createdAt: 'desc' }

    const vehicles = await prisma.vehicle.findMany({ where, orderBy })
    res.json(vehicles)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, isDemo: req.isDemo },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 10, include: { driver: true } },
        maintenance: { orderBy: { openedAt: 'desc' }, take: 10 },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    })
    if (!vehicle) throw notFound('Vehicle not found')
    res.json(vehicle)
  } catch (err) {
    next(err)
  }
})

router.post('/', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const data = vehicleSchema.parse(req.body)
    const vehicle = await prisma.vehicle.create({ data: { ...data, isDemo: req.isDemo } })
    emitEvent('vehicles:changed', { id: vehicle.id })
    res.status(201).json(vehicle)
  } catch (err) {
    // R1: registration number must be unique.
    if (err.code === 'P2002') return next(conflict('A vehicle with this registration number already exists'))
    next(err)
  }
})

router.patch('/:id', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const data = vehicleSchema.partial().parse(req.body)
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data })
    emitEvent('vehicles:changed', { id: vehicle.id })
    res.json(vehicle)
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('A vehicle with this registration number already exists'))
    if (err.code === 'P2025') return next(notFound('Vehicle not found'))
    next(err)
  }
})

router.delete('/:id', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const trips = await prisma.trip.count({ where: { vehicleId: req.params.id } })
    if (trips > 0) throw conflict('Cannot delete a vehicle that has trip history — retire it instead')
    await prisma.vehicle.delete({ where: { id: req.params.id } })
    emitEvent('vehicles:changed', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') return next(notFound('Vehicle not found'))
    next(err)
  }
})

export default router
