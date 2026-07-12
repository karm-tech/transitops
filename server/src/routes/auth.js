import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { verifyPassword, signToken, publicUser } from '../lib/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { badRequest, HttpError } from '../middleware/error.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password')
    }
    res.json({ token: signToken(user, false), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// One-click demo login: signs in as one of the seeded role accounts.
router.post('/demo', async (req, res, next) => {
  try {
    const role = req.body?.role || ROLES.FLEET_MANAGER
    const emailByRole = {
      [ROLES.ADMIN]: 'admin@transitops.app',
      [ROLES.FLEET_MANAGER]: 'manager@transitops.app',
      [ROLES.DISPATCHER]: 'dispatcher@transitops.app',
      [ROLES.SAFETY_OFFICER]: 'safety@transitops.app',
      [ROLES.FINANCIAL_ANALYST]: 'finance@transitops.app',
    }
    const email = emailByRole[role]
    if (!email) throw badRequest('Unknown demo role')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(404, 'Demo account not seeded — run npm run seed')
    res.json({ token: signToken(user, true), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))

router.patch('/preferences', requireAuth, async (req, res, next) => {
  try {
    const { notifyEnabled } = z.object({ notifyEnabled: z.boolean() }).parse(req.body)
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { notifyEnabled } })
    res.json({ user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

export default router
