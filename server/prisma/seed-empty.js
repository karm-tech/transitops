import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { ROLES, DEFAULT_RBAC } from '../src/lib/constants.js'

const prisma = new PrismaClient()

// Clean database: keeps only what's needed to log in and start — no operational data.
async function main() {
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

  const passwordHash = await bcrypt.hash('demo1234', 10)
  await prisma.user.createMany({
    data: [
      { name: 'Admin', email: 'admin@transitops.app', passwordHash, role: ROLES.ADMIN },
      { name: 'Fleet Manager', email: 'manager@transitops.app', passwordHash, role: ROLES.FLEET_MANAGER },
      { name: 'Dispatcher', email: 'dispatcher@transitops.app', passwordHash, role: ROLES.DISPATCHER },
      { name: 'Safety Officer', email: 'safety@transitops.app', passwordHash, role: ROLES.SAFETY_OFFICER },
      { name: 'Financial Analyst', email: 'finance@transitops.app', passwordHash, role: ROLES.FINANCIAL_ANALYST },
    ],
  })
  await prisma.vehicleType.createMany({
    data: ['Van', 'Truck', 'Mini', 'Bus', 'Tempo'].flatMap((name) => [{ name, isDemo: true }, { name, isDemo: false }]),
  })
  await prisma.setting.create({ data: { isDemo: true, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })
  await prisma.setting.create({ data: { isDemo: false, rbacMatrix: JSON.stringify(DEFAULT_RBAC) } })

  console.log('Clean DB ready: 5 login accounts + vehicle types + settings. No operational data.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
