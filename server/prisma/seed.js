import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { ROLES, DEFAULT_RBAC } from '../src/lib/constants.js'

const prisma = new PrismaClient()

const daysFromNow = (n) => new Date(Date.now() + n * 86400000)

async function reset() {
  await prisma.expense.deleteMany()
  await prisma.fuelLog.deleteMany()
  await prisma.maintenance.deleteMany()
  await prisma.vehicleDocument.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.vehicleType.deleteMany()
  await prisma.notification.deleteMany()
}

async function main() {
  await reset()

  // Vehicle types + settings exist per workspace (demo and real each get their own).
  await prisma.vehicleType.createMany({
    data: ['Van', 'Truck', 'Mini', 'Bus', 'Tempo'].flatMap((name) => [{ name, isDemo: true }, { name, isDemo: false }]),
  })
  await prisma.setting.create({ data: { isDemo: true, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })
  await prisma.setting.create({ data: { isDemo: false, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })

  const passwordHash = await bcrypt.hash('demo1234', 10)
  await prisma.user.createMany({
    data: [
      { name: 'Admin', email: 'admin@transitops.app', passwordHash, role: ROLES.ADMIN },
      { name: 'Karm (Fleet Manager)', email: 'manager@transitops.app', passwordHash, role: ROLES.FLEET_MANAGER },
      { name: 'Ravi (Dispatcher)', email: 'dispatcher@transitops.app', passwordHash, role: ROLES.DISPATCHER },
      { name: 'Sana (Safety Officer)', email: 'safety@transitops.app', passwordHash, role: ROLES.SAFETY_OFFICER },
      { name: 'Neha (Financial Analyst)', email: 'finance@transitops.app', passwordHash, role: ROLES.FINANCIAL_ANALYST },
    ],
  })

  // Everything below is DEMO data (isDemo: true) — only shown to demo-button sessions.
  const demo = { isDemo: true }

  // Vehicles — cover every status so all rules are demonstrable.
  const van05 = await prisma.vehicle.create({ data: { ...demo, regNumber: 'GJ01-VAN-05', name: 'Tata Ace', type: 'Van', maxLoadKg: 500, odometer: 74000, acquisitionCost: 620000, region: 'West', status: 'Available' } })
  const truck11 = await prisma.vehicle.create({ data: { ...demo, regNumber: 'GJ01-TRK-11', name: 'Ashok Leyland', type: 'Truck', maxLoadKg: 5000, odometer: 182000, acquisitionCost: 2460000, region: 'North', status: 'OnTrip' } })
  const mini03 = await prisma.vehicle.create({ data: { ...demo, regNumber: 'GJ01-MIN-03', name: 'Mahindra Mini', type: 'Mini', maxLoadKg: 1000, odometer: 66000, acquisitionCost: 410000, region: 'West', status: 'InShop' } })
  await prisma.vehicle.create({ data: { ...demo, regNumber: 'GJ01-VAN-09', name: 'Tata Ace (old)', type: 'Van', maxLoadKg: 500, odometer: 249000, acquisitionCost: 540000, region: 'South', status: 'Retired' } })
  const truck04 = await prisma.vehicle.create({ data: { ...demo, regNumber: 'GJ01-TRK-04', name: 'Eicher Pro', type: 'Truck', maxLoadKg: 8000, odometer: 98000, acquisitionCost: 3100000, region: 'East', status: 'Available' } })

  // Drivers — includes an expired license and a suspended driver (edge cases for R3).
  const alex = await prisma.driver.create({ data: { ...demo, name: 'Alex', licenseNumber: 'DL-8825', licenseCategory: 'LMV', licenseExpiry: daysFromNow(540), contact: '98765-00001', safetyScore: 96, status: 'Available' } })
  await prisma.driver.create({ data: { ...demo, name: 'John', licenseNumber: 'DL-4420', licenseCategory: 'HMV', licenseExpiry: daysFromNow(-120), contact: '98765-00002', safetyScore: 61, status: 'Suspended' } })
  const priya = await prisma.driver.create({ data: { ...demo, name: 'Priya', licenseNumber: 'DL-9705', licenseCategory: 'LMV', licenseExpiry: daysFromNow(300), contact: '98765-00003', safetyScore: 91, status: 'OnTrip' } })
  await prisma.driver.create({ data: { ...demo, name: 'Suresh', licenseNumber: 'DL-1204', licenseCategory: 'HMV', licenseExpiry: daysFromNow(80), contact: '98765-00004', safetyScore: 83, status: 'OffDuty' } })
  await prisma.driver.create({ data: { ...demo, name: 'Meena', licenseNumber: 'DL-3391', licenseCategory: 'LMV', licenseExpiry: daysFromNow(20), contact: '98765-00005', safetyScore: 88, status: 'Available' } })

  // Trips — one live (Dispatched), one finished (Completed, for ROI), one Draft.
  await prisma.trip.create({ data: { ...demo, code: 'TRIP-0001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', cargoWeightKg: 4200, plannedDistanceKm: 32, status: 'Dispatched', dispatchedAt: daysFromNow(0), vehicleId: truck11.id, driverId: priya.id } })
  await prisma.trip.create({ data: { ...demo, code: 'TRIP-0002', source: 'Vatva Industrial Area', destination: 'Surat Warehouse', cargoWeightKg: 450, plannedDistanceKm: 265, status: 'Completed', dispatchedAt: daysFromNow(-3), completedAt: daysFromNow(-2), finalOdometer: 74000, fuelConsumed: 31, revenue: 42000, vehicleId: van05.id, driverId: alex.id } })
  await prisma.trip.create({ data: { ...demo, code: 'TRIP-0003', source: 'Kalol Depot', destination: 'Mehsana', cargoWeightKg: 900, plannedDistanceKm: 58, status: 'Draft', vehicleId: truck04.id, driverId: alex.id } })

  // Maintenance — active record keeps MIN-03 In Shop (R9); a closed record as history.
  await prisma.maintenance.create({ data: { ...demo, type: 'Oil Change', description: 'Scheduled service', cost: 2800, status: 'Active', vehicleId: mini03.id } })
  await prisma.maintenance.create({ data: { ...demo, type: 'Engine Repair', description: 'Coolant leak fixed', cost: 18500, status: 'Closed', closedAt: daysFromNow(-5), vehicleId: truck04.id } })

  await prisma.fuelLog.createMany({
    data: [
      { ...demo, liters: 42, cost: 3780, vehicleId: van05.id },
      { ...demo, liters: 90, cost: 8400, vehicleId: truck11.id },
      { ...demo, liters: 28, cost: 2520, vehicleId: mini03.id },
    ],
  })

  await prisma.expense.createMany({
    data: [
      { ...demo, category: 'Toll', amount: 120, vehicleId: van05.id, note: 'Expressway toll' },
      { ...demo, category: 'Toll', amount: 340, vehicleId: truck11.id, note: 'Highway toll' },
      { ...demo, category: 'Other', amount: 150, vehicleId: truck04.id, note: 'Parking' },
    ],
  })

  await prisma.vehicleDocument.createMany({
    data: [
      { ...demo, docType: 'RC', fileName: 'van05-rc.pdf', filePath: '/uploads/sample-rc.pdf', vehicleId: van05.id },
      { ...demo, docType: 'Insurance', fileName: 'van05-insurance.pdf', filePath: '/uploads/sample-insurance.pdf', vehicleId: van05.id },
    ],
  })

  await prisma.notification.createMany({
    data: [
      { ...demo, type: 'trip', message: 'TRIP-0001 dispatched: Gandhinagar Depot → Ahmedabad Hub' },
      { ...demo, type: 'maintenance', message: 'GJ01-MIN-03 moved to In Shop — Oil Change' },
      { ...demo, type: 'license', message: "Meena's licence DL-3391 expires soon (20 days)", read: true },
    ],
  })

  console.log('Seed complete: demo data (isDemo=true). Demo buttons see it; credential login starts empty.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
