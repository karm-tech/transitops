import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword, signToken, publicUser } from '../lib/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { badRequest, conflict, HttpError } from '../middleware/error.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password')
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// New signups get the non-privileged Dispatcher role — roles are never self-assigned.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw conflict('An account with this email already exists')

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: ROLES.DISPATCHER },
    })
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// One-click demo login: signs in as one of the seeded role accounts.
router.post('/demo', async (req, res, next) => {
  try {
    const role = req.body?.role || ROLES.FLEET_MANAGER
    const emailByRole = {
      [ROLES.FLEET_MANAGER]: 'manager@transitops.app',
      [ROLES.DISPATCHER]: 'dispatcher@transitops.app',
      [ROLES.SAFETY_OFFICER]: 'safety@transitops.app',
      [ROLES.FINANCIAL_ANALYST]: 'finance@transitops.app',
    }
    const email = emailByRole[role]
    if (!email) throw badRequest('Unknown demo role')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(404, 'Demo account not seeded — run npm run seed')
    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))

export default router
