import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const demo = req.isDemo
    const [vehicles, trips, fuel, maintenance, expenses] = await Promise.all([
      prisma.vehicle.findMany({ where: { isDemo: demo } }),
      prisma.trip.findMany({ where: { isDemo: demo, status: 'Completed' } }),
      prisma.fuelLog.findMany({ where: { isDemo: demo } }),
      prisma.maintenance.findMany({ where: { isDemo: demo } }),
      prisma.expense.findMany({ where: { isDemo: demo } }),
    ])

    const sumFor = (rows, id, field, key = 'vehicleId') =>
      rows.filter((r) => r[key] === id).reduce((s, r) => s + (r[field] || 0), 0)

    const perVehicle = vehicles.map((v) => {
      const revenue = sumFor(trips, v.id, 'revenue')
      const fuelCost = sumFor(fuel, v.id, 'cost')
      const maintenanceCost = sumFor(maintenance, v.id, 'cost')
      const otherCost = sumFor(expenses, v.id, 'amount')
      const operationalCost = fuelCost + maintenanceCost + otherCost
      const roi = v.acquisitionCost ? ((revenue - (fuelCost + maintenanceCost)) / v.acquisitionCost) * 100 : 0
      return { id: v.id, regNumber: v.regNumber, name: v.name, revenue, fuelCost, maintenanceCost, otherCost, operationalCost, roi: Number(roi.toFixed(1)) }
    })

    const totalDistance = trips.reduce((s, t) => s + (t.plannedDistanceKm || 0), 0)
    // Fuel efficiency = distance / fuel actually consumed on trips (Step 6 captures this on completion).
    const totalLitres = trips.reduce((s, t) => s + (t.fuelConsumed || 0), 0)
    const totalRevenue = trips.reduce((s, t) => s + (t.revenue || 0), 0)
    const totalFuelCost = fuel.reduce((s, f) => s + (f.cost || 0), 0)
    const totalMaint = maintenance.reduce((s, m) => s + (m.cost || 0), 0)
    const totalOther = expenses.reduce((s, e) => s + (e.amount || 0), 0)
    const totalAcq = vehicles.reduce((s, v) => s + (v.acquisitionCost || 0), 0)
    const onTrip = vehicles.filter((v) => v.status === 'OnTrip').length
    const active = vehicles.filter((v) => v.status !== 'Retired').length || 1

    // Monthly revenue from completed trips (YYYY-MM).
    const byMonth = {}
    for (const t of trips) {
      const d = t.completedAt || t.createdAt
      const key = new Date(d).toISOString().slice(0, 7)
      byMonth[key] = (byMonth[key] || 0) + (t.revenue || 0)
    }
    const monthlyRevenue = Object.entries(byMonth).sort().map(([month, revenue]) => ({ month, revenue }))

    res.json({
      metrics: {
        fuelEfficiency: totalLitres ? Number((totalDistance / totalLitres).toFixed(1)) : 0,
        fleetUtilization: Math.round((onTrip / active) * 100),
        operationalCost: totalFuelCost + totalMaint + totalOther,
        vehicleRoi: totalAcq ? Number((((totalRevenue - (totalFuelCost + totalMaint)) / totalAcq) * 100).toFixed(1)) : 0,
      },
      monthlyRevenue,
      topCostVehicles: [...perVehicle].sort((a, b) => b.operationalCost - a.operationalCost).slice(0, 5),
      perVehicle,
    })
  } catch (err) {
    next(err)
  }
})

export default router
