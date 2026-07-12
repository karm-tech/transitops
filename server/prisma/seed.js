import fs from 'fs'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { ROLES, DEFAULT_RBAC } from '../src/lib/constants.js'

const prisma = new PrismaClient()

const daysFromNow = (n) => new Date(Date.now() + n * 86400000)

const uploadDir = 'uploads'
fs.mkdirSync(uploadDir, { recursive: true })

// Writes a minimal but valid PDF to /uploads and returns its public path.
function writePdf(fileBase, title) {
  const stream = `BT /F1 16 Tf 40 150 Td (${title}) Tj 0 -28 Td /F1 10 Tf (TransitOps - sample document) Tj ET`
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 320 200]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>',
    `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = []
  objs.forEach((body, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((o) => (pdf += String(o).padStart(10, '0') + ' 00000 n \n'))
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`

  const fileName = `${fileBase}.pdf`
  fs.writeFileSync(`${uploadDir}/${fileName}`, Buffer.from(pdf, 'latin1'))
  return `/${uploadDir}/${fileName}`
}

async function reset() {
  await prisma.expense.deleteMany()
  await prisma.fuelLog.deleteMany()
  await prisma.maintenance.deleteMany()
  await prisma.vehicleDocument.deleteMany()
  await prisma.driverDocument.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.vehicleType.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.mailLog.deleteMany()
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
      { name: 'System Admin', firstName: 'System', lastName: 'Admin', phone: '90000-00000', email: 'admin@transitops.app', passwordHash, role: ROLES.ADMIN },
      { name: 'Karm Chauhan', firstName: 'Karm', lastName: 'Chauhan', phone: '90000-00001', email: 'manager@transitops.app', passwordHash, role: ROLES.FLEET_MANAGER },
      { name: 'Ravi Patel', firstName: 'Ravi', lastName: 'Patel', phone: '90000-00002', email: 'dispatcher@transitops.app', passwordHash, role: ROLES.DISPATCHER },
      { name: 'Sana Shaikh', firstName: 'Sana', lastName: 'Shaikh', phone: '90000-00003', email: 'safety@transitops.app', passwordHash, role: ROLES.SAFETY_OFFICER },
      { name: 'Neha Verma', firstName: 'Neha', lastName: 'Verma', phone: '90000-00004', email: 'finance@transitops.app', passwordHash, role: ROLES.FINANCIAL_ANALYST },
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

  // Attach real sample PDF documents to ~70% of vehicles and drivers.
  const demoVehicles = await prisma.vehicle.findMany({ where: { isDemo: true }, orderBy: { regNumber: 'asc' } })
  for (const v of demoVehicles.slice(0, Math.ceil(demoVehicles.length * 0.7))) {
    await prisma.vehicleDocument.createMany({
      data: [
        { ...demo, docType: 'RC', fileName: `${v.regNumber}-RC.pdf`, filePath: writePdf(`${v.regNumber}-RC`, `RC - ${v.regNumber}`), vehicleId: v.id },
        { ...demo, docType: 'Insurance', fileName: `${v.regNumber}-Insurance.pdf`, filePath: writePdf(`${v.regNumber}-INS`, `Insurance - ${v.regNumber}`), vehicleId: v.id },
      ],
    })
  }

  const demoDrivers = await prisma.driver.findMany({ where: { isDemo: true }, orderBy: { name: 'asc' } })
  for (const d of demoDrivers.slice(0, Math.ceil(demoDrivers.length * 0.7))) {
    await prisma.driverDocument.create({
      data: { ...demo, docType: 'Licence', fileName: `${d.licenseNumber}-Licence.pdf`, filePath: writePdf(`${d.licenseNumber}-LIC`, `Driving Licence - ${d.name}`), driverId: d.id },
    })
  }

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
