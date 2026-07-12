import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { conflict, notFound } from '../middleware/error.js'
import { emitEvent } from '../lib/realtime.js'
import { ROLES, DRIVER_STATUS } from '../lib/constants.js'

const router = Router()

const driverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(3).transform((v) => v.trim().toUpperCase()),
  licenseCategory: z.string().min(2),
  licenseExpiry: z.coerce.date(),
  contact: z.string().optional().nullable(),
  safetyScore: z.coerce.number().int().min(0).max(100).default(100),
  status: z.enum(DRIVER_STATUS).default('Available'),
})

const canWrite = requireRole(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER)

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { search, status, sort = 'createdAt' } = req.query
    const where = {
      isDemo: req.isDemo,
      ...(status ? { status } : {}),
      ...(search
        ? { OR: [{ name: { contains: String(search) } }, { licenseNumber: { contains: String(search) } }] }
        : {}),
    }
    const orderBy = ['name', 'safetyScore', 'licenseExpiry', 'createdAt'].includes(String(sort))
      ? { [String(sort)]: sort === 'safetyScore' ? 'desc' : sort === 'createdAt' ? 'desc' : 'asc' }
      : { createdAt: 'desc' }

    const drivers = await prisma.driver.findMany({ where, orderBy })
    res.json(drivers)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const driver = await prisma.driver.findFirst({
      where: { id: req.params.id, isDemo: req.isDemo },
      include: { trips: { orderBy: { createdAt: 'desc' }, take: 10, include: { vehicle: true } } },
    })
    if (!driver) throw notFound('Driver not found')
    res.json(driver)
  } catch (err) {
    next(err)
  }
})

router.post('/', canWrite, async (req, res, next) => {
  try {
    const data = driverSchema.parse(req.body)
    const driver = await prisma.driver.create({ data: { ...data, isDemo: req.isDemo } })
    emitEvent('drivers:changed', { id: driver.id })
    res.status(201).json(driver)
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('A driver with this license number already exists'))
    next(err)
  }
})

router.patch('/:id', canWrite, async (req, res, next) => {
  try {
    const data = driverSchema.partial().parse(req.body)
    const driver = await prisma.driver.update({ where: { id: req.params.id }, data })
    emitEvent('drivers:changed', { id: driver.id })
    res.json(driver)
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('A driver with this license number already exists'))
    if (err.code === 'P2025') return next(notFound('Driver not found'))
    next(err)
  }
})

router.delete('/:id', canWrite, async (req, res, next) => {
  try {
    const trips = await prisma.trip.count({ where: { driverId: req.params.id } })
    if (trips > 0) throw conflict('Cannot delete a driver with trip history — set them Off Duty instead')
    await prisma.driver.delete({ where: { id: req.params.id } })
    emitEvent('drivers:changed', { id: req.params.id })
    res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') return next(notFound('Driver not found'))
    next(err)
  }
})

export default router
