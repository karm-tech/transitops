import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { notFound } from '../middleware/error.js'
import { emitEvent } from '../lib/realtime.js'
import { ROLES, EXPENSE_CATEGORIES } from '../lib/constants.js'

const router = Router()

const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.coerce.number().positive(),
  cost: z.coerce.number().nonnegative(),
  date: z.coerce.date().optional(),
})

const expenseSchema = z.object({
  vehicleId: z.string().min(1),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().nonnegative(),
  note: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
})

const canWrite = requireRole(ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST)

router.use(requireAuth)

router.get('/fuel', async (_req, res, next) => {
  try {
    const logs = await prisma.fuelLog.findMany({ orderBy: { date: 'desc' }, include: { vehicle: true } })
    res.json(logs)
  } catch (err) {
    next(err)
  }
})

router.post('/fuel', canWrite, async (req, res, next) => {
  try {
    const data = fuelSchema.parse(req.body)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
    if (!vehicle) throw notFound('Vehicle not found')
    const log = await prisma.fuelLog.create({ data })
    emitEvent('finance:changed', { id: log.id })
    res.status(201).json(log)
  } catch (err) {
    next(err)
  }
})

router.get('/expenses', async (_req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' }, include: { vehicle: true } })
    res.json(expenses)
  } catch (err) {
    next(err)
  }
})

router.post('/expenses', canWrite, async (req, res, next) => {
  try {
    const data = expenseSchema.parse(req.body)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } })
    if (!vehicle) throw notFound('Vehicle not found')
    const expense = await prisma.expense.create({ data })
    emitEvent('finance:changed', { id: expense.id })
    res.status(201).json(expense)
  } catch (err) {
    next(err)
  }
})

// Operational cost per vehicle = Fuel + Maintenance (+ other expenses), computed on the fly.
router.get('/summary', async (_req, res, next) => {
  try {
    const [vehicles, fuel, maintenance, expenses] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.fuelLog.groupBy({ by: ['vehicleId'], _sum: { cost: true } }),
      prisma.maintenance.groupBy({ by: ['vehicleId'], _sum: { cost: true } }),
      prisma.expense.groupBy({ by: ['vehicleId'], _sum: { amount: true } }),
    ])

    const sumBy = (rows, key) => Object.fromEntries(rows.map((r) => [r.vehicleId, r._sum[key] || 0]))
    const fuelBy = sumBy(fuel, 'cost')
    const maintBy = sumBy(maintenance, 'cost')
    const expBy = sumBy(expenses, 'amount')

    const perVehicle = vehicles
      .map((v) => {
        const fuelCost = fuelBy[v.id] || 0
        const maintCost = maintBy[v.id] || 0
        const otherCost = expBy[v.id] || 0
        return {
          id: v.id,
          regNumber: v.regNumber,
          name: v.name,
          fuelCost,
          maintenanceCost: maintCost,
          otherCost,
          operationalCost: fuelCost + maintCost + otherCost,
        }
      })
      .sort((a, b) => b.operationalCost - a.operationalCost)

    const totals = perVehicle.reduce(
      (acc, v) => ({
        fuel: acc.fuel + v.fuelCost,
        maintenance: acc.maintenance + v.maintenanceCost,
        other: acc.other + v.otherCost,
        operational: acc.operational + v.operationalCost,
      }),
      { fuel: 0, maintenance: 0, other: 0, operational: 0 },
    )

    res.json({ totals, perVehicle })
  } catch (err) {
    next(err)
  }
})

export default router
