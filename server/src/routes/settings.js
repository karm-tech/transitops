import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { ROLES, DEFAULT_RBAC } from '../lib/constants.js'

const router = Router()

async function getSettings() {
  let setting = await prisma.setting.findUnique({ where: { id: 1 } })
  if (!setting) {
    setting = await prisma.setting.create({ data: { id: 1, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })
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

router.get('/', async (_req, res, next) => {
  try {
    res.json(toDto(await getSettings()))
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
    await getSettings()
    const updated = await prisma.setting.update({ where: { id: 1 }, data })
    res.json(toDto(updated))
  } catch (err) {
    next(err)
  }
})

router.patch('/rbac', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const matrix = z.record(z.array(z.string())).parse(req.body.rbacMatrix)
    await getSettings()
    const updated = await prisma.setting.update({ where: { id: 1 }, data: { rbacMatrix: JSON.stringify(matrix) } })
    res.json(toDto(updated))
  } catch (err) {
    next(err)
  }
})

export default router
