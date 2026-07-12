import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { hashPassword, publicUser } from '../lib/auth.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { conflict, notFound, badRequest } from '../middleware/error.js'
import { ROLES, ROLE_VALUES } from '../lib/constants.js'

const router = Router()

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLE_VALUES),
  status: z.enum(['Active', 'Inactive']).default('Active'),
})

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

// Every route here is Admin-only — roles are assigned only by an Admin.
router.use(requireAuth, requireRole(ROLES.ADMIN))

router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(users.map(publicUser))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { password, ...rest } = createSchema.parse(req.body)
    const user = await prisma.user.create({
      data: { ...rest, passwordHash: await hashPassword(password) },
    })
    res.status(201).json(publicUser(user))
  } catch (err) {
    if (err.code === 'P2002') return next(conflict('An account with this email already exists'))
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body)
    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) throw notFound('User not found')

    // Never allow demoting or deactivating the last remaining Admin.
    const losingAdmin = target.role === ROLES.ADMIN && (data.role && data.role !== ROLES.ADMIN || data.status === 'Inactive')
    if (losingAdmin) {
      const admins = await prisma.user.count({ where: { role: ROLES.ADMIN, status: 'Active' } })
      if (admins <= 1) throw badRequest('At least one active Admin must remain')
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data })
    res.json(publicUser(user))
  } catch (err) {
    if (err.code === 'P2025') return next(notFound('User not found'))
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) throw badRequest('You cannot delete your own account')
    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) throw notFound('User not found')

    if (target.role === ROLES.ADMIN) {
      const admins = await prisma.user.count({ where: { role: ROLES.ADMIN } })
      if (admins <= 1) throw badRequest('Cannot delete the last Admin')
    }

    await prisma.user.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') return next(notFound('User not found'))
    next(err)
  }
})

export default router
