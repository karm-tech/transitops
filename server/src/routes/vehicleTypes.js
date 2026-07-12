import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { conflict, notFound } from '../middleware/error.js'
import { ROLES } from '../lib/constants.js'

const router = Router()
const nameSchema = z.object({ name: z.string().min(2).transform((v) => v.trim()) })

router.use(requireAuth)

router.get('/', async (_req, res, next) => {
  try {
    const types = await prisma.vehicleType.findMany({ orderBy: { name: 'asc' } })
    res.json(types)
  } catch (err) {
    next(err)
  }
})

router.post('/', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const { name } = nameSchema.parse(req.body)
    const type = await prisma.vehicleType.create({ data: { name } })
    res.status(201).json(type)
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('That type already exists'))
    next(err)
  }
})

router.patch('/:id', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const { name } = nameSchema.parse(req.body)
    const existing = await prisma.vehicleType.findUnique({ where: { id: req.params.id } })
    if (!existing) throw notFound('Type not found')

    // Keep vehicles in sync when a type is renamed.
    await prisma.$transaction([
      prisma.vehicle.updateMany({ where: { type: existing.name }, data: { type: name } }),
      prisma.vehicleType.update({ where: { id: req.params.id }, data: { name } }),
    ])
    res.json({ id: req.params.id, name })
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('That type already exists'))
    next(err)
  }
})

router.delete('/:id', requireRole(ROLES.FLEET_MANAGER), async (req, res, next) => {
  try {
    const type = await prisma.vehicleType.findUnique({ where: { id: req.params.id } })
    if (!type) throw notFound('Type not found')

    const inUse = await prisma.vehicle.count({ where: { type: type.name } })
    if (inUse > 0) throw conflict(`Cannot delete "${type.name}" — ${inUse} vehicle(s) use it`)

    await prisma.vehicleType.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
