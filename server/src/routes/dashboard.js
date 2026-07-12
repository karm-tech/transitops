import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const { type, status, region } = req.query
    const vehicleWhere = {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(region ? { region } : {}),
    }

    const [vehicles, dispatched, draft, driversOnDuty, recent, regions] = await Promise.all([
      prisma.vehicle.findMany({ where: vehicleWhere }),
      prisma.trip.count({ where: { status: 'Dispatched' } }),
      prisma.trip.count({ where: { status: 'Draft' } }),
      prisma.driver.count({ where: { status: { in: ['Available', 'OnTrip'] } } }),
      prisma.trip.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { vehicle: true, driver: true } }),
      prisma.vehicle.findMany({ distinct: ['region'], select: { region: true } }),
    ])

    const countBy = (s) => vehicles.filter((v) => v.status === s).length
    const breakdown = {
      Available: countBy('Available'),
      OnTrip: countBy('OnTrip'),
      InShop: countBy('InShop'),
      Retired: countBy('Retired'),
    }
    const activeVehicles = vehicles.length - breakdown.Retired
    const utilBase = activeVehicles || 1

    res.json({
      kpis: {
        activeVehicles,
        availableVehicles: breakdown.Available,
        inMaintenance: breakdown.InShop,
        activeTrips: dispatched,
        pendingTrips: draft,
        driversOnDuty,
        fleetUtilization: Math.round((breakdown.OnTrip / utilBase) * 100),
      },
      breakdown,
      recentTrips: recent.map((t) => ({
        id: t.id,
        code: t.code,
        route: `${t.source} → ${t.destination}`,
        vehicle: t.vehicle?.regNumber,
        driver: t.driver?.name,
        status: t.status,
      })),
      regions: regions.map((r) => r.region).filter(Boolean),
    })
  } catch (err) {
    next(err)
  }
})

export default router
