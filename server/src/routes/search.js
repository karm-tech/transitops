import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Global search across vehicles, drivers and trips — case-insensitive, scoped to the workspace.
router.get('/', async (req, res, next) => {
  try {
    const term = String(req.query.q || '').trim().toLowerCase()
    if (!term) return res.json({ vehicles: [], drivers: [], trips: [] })

    const demo = req.isDemo
    const [allVehicles, allDrivers, allTrips] = await Promise.all([
      prisma.vehicle.findMany({ where: { isDemo: demo } }),
      prisma.driver.findMany({ where: { isDemo: demo } }),
      prisma.trip.findMany({ where: { isDemo: demo }, include: { driver: true, vehicle: true } }),
    ])

    const match = (text) => text.toLowerCase().includes(term)

    res.json({
      vehicles: allVehicles
        .filter((v) => match(`${v.regNumber} ${v.name} ${v.type}`))
        .slice(0, 5)
        .map((v) => ({ id: v.id, label: v.regNumber, sub: `${v.name} · ${v.type}`, status: v.status })),
      drivers: allDrivers
        .filter((d) => match(`${d.name} ${d.licenseNumber}`))
        .slice(0, 5)
        .map((d) => ({ id: d.id, label: d.name, sub: d.licenseNumber, status: d.status })),
      trips: allTrips
        .filter((t) => match(`${t.code} ${t.source} ${t.destination} ${t.vehicle?.regNumber || ''} ${t.driver?.name || ''}`))
        .slice(0, 5)
        .map((t) => ({ id: t.id, label: t.code, sub: `${t.source} → ${t.destination}`, status: t.status })),
    })
  } catch (err) {
    next(err)
  }
})

export default router
