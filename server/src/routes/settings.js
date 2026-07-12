import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { ROLES, DEFAULT_RBAC } from '../lib/constants.js'

const router = Router()

async function getSettings(isDemo) {
  let setting = await prisma.setting.findUnique({ where: { isDemo } })
  if (!setting) {
    setting = await prisma.setting.create({ data: { isDemo, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })
  }
  return setting
}

const toDto = (s) => ({
  depotName: s.depotName,
  currency: s.currency,
  distanceUnit: s.distanceUnit,
  rbacMatrix: JSON.parse(s.rbacMatrix || '{}'),
})

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    res.json(toDto(await getSettings(req.isDemo)))
  } catch (err) {
    next(err)
  }
})

const generalSchema = z.object({
  depotName: z.string().min(2),
  currency: z.enum(['INR', 'USD', 'EUR']),
  distanceUnit: z.enum(['km', 'mi']),
})

router.patch('/', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const data = generalSchema.parse(req.body)
    const current = await getSettings(req.isDemo)
    const updated = await prisma.setting.update({ where: { id: current.id }, data })
    res.json(toDto(updated))
  } catch (err) {
    next(err)
  }
})

router.patch('/rbac', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const matrix = z.record(z.array(z.string())).parse(req.body.rbacMatrix)
    const current = await getSettings(req.isDemo)
    const updated = await prisma.setting.update({ where: { id: current.id }, data: { rbacMatrix: JSON.stringify(matrix) } })
    res.json(toDto(updated))
  } catch (err) {
    next(err)
  }
})

export default router
