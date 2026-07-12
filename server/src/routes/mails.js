import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Sent-mail outbox for the current workspace (welcome emails, licence reminders, etc.).
router.get('/', async (req, res, next) => {
  try {
    const mails = await prisma.mailLog.findMany({
      where: { isDemo: req.isDemo },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(mails)
  } catch (err) {
    next(err)
  }
})

export default router
