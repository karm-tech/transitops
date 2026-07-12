import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword, signToken, publicUser } from '../lib/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { badRequest, conflict, HttpError } from '../middleware/error.js'
import { sendMail } from '../lib/mailer.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  firstName: z.string().min(1, 'is required'),
  lastName: z.string().min(1, 'is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('enter a valid email'),
  password: z.string().min(6, 'must be at least 6 characters'),
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

// Public sign-up — new accounts get the non-privileged Dispatcher role (never self-elevating).
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw conflict('An account with this email already exists')
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        phone: phone || null,
        email,
        passwordHash: await hashPassword(password),
        role: ROLES.DISPATCHER,
      },
    })
    // Welcome email on sign-up (recorded in the Sent Mails outbox).
    await sendMail({
      to: email,
      subject: '🎉 Welcome to TransitOps!',
      text: `Hi ${firstName}, congratulations — your TransitOps account is ready. You can now add vehicles, drivers and start dispatching trips.`,
      type: 'welcome',
      isDemo: false,
    })
    res.status(201).json({ token: signToken(user, false), user: publicUser(user) })
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

const profileSchema = z.object({
  firstName: z.string().min(1, 'is required'),
  lastName: z.string().min(1, 'is required'),
  phone: z.string().optional().nullable(),
})

router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = profileSchema.parse(req.body)
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone: phone || null, name: `${firstName} ${lastName}` },
    })
    res.json({ user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

export default router
