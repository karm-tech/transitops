import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { notify } from '../lib/notify.js'
import { sendMail } from '../lib/mailer.js'
import { ROLES } from '../lib/constants.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    if (!req.user.notifyEnabled) return res.json({ items: [], unread: 0 })
    const items = await prisma.notification.findMany({ where: { isDemo: req.isDemo }, orderBy: { createdAt: 'desc' }, take: 20 })
    const unread = await prisma.notification.count({ where: { isDemo: req.isDemo, read: false } })
    res.json({ items, unread })
  } catch (err) {
    next(err)
  }
})

router.post('/read-all', async (_req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { isDemo: req.isDemo, read: false }, data: { read: true } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// License-expiry reminders: notify + email drivers with expired / soon-to-expire licences (B5).
router.post('/license-check', requireRole(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER), async (_req, res, next) => {
  try {
    const soon = new Date(Date.now() + 30 * 86400000)
    const drivers = await prisma.driver.findMany({ where: { isDemo: req.isDemo, licenseExpiry: { lte: soon } } })

    for (const d of drivers) {
      const expired = new Date(d.licenseExpiry) < new Date()
      const msg = `${d.name}'s licence ${d.licenseNumber} ${expired ? 'has expired' : 'expires soon'} (${new Date(d.licenseExpiry).toLocaleDateString()})`
      await notify('license', msg, req.isDemo)
      await sendMail({ to: 'safety@transitops.app', subject: 'Driver licence reminder', text: msg })
    }
    res.json({ notified: drivers.length })
  } catch (err) {
    next(err)
  }
})

export default router
