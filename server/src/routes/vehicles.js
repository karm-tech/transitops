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
  regNumber: z.string().min(3).transform((v) => v.trim().toUpperCase()),
  name: z.string().min(2),
  type: z.string().min(2).transform((v) => v.trim()),
  maxLoadKg: z.coerce.number().int().positive(),
  odometer: z.coerce.number().int().nonnegative().default(0),
  acquisitionCost: z.coerce.number().nonnegative().default(0),
  region: z.string().optional().nullable(),
  status: z.enum(VEHICLE_STATUS).default('Available'),
})

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { search, status, type, sort = 'createdAt' } = req.query
    const where = {
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
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 10, include: { driver: true } },
        maintenance: { orderBy: { openedAt: 'desc' }, take: 10 },
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
    const vehicle = await prisma.vehicle.create({ data })
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
