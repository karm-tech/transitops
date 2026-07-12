import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { prisma } from './lib/prisma.js'
import { setIO } from './lib/realtime.js'
import { errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import vehicleRoutes from './routes/vehicles.js'
import vehicleTypeRoutes from './routes/vehicleTypes.js'
import userRoutes from './routes/users.js'
import driverRoutes from './routes/drivers.js'
import tripRoutes from './routes/trips.js'
import maintenanceRoutes from './routes/maintenance.js'
import financeRoutes from './routes/finance.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/uploads', express.static('uploads'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'transitops-api' }))

app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/vehicle-types', vehicleTypeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/finance', financeRoutes)

app.get('/api/db/summary', async (_req, res, next) => {
  try {
    const [vehicles, drivers, trips, maintenance, users] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.trip.count(),
      prisma.maintenance.count(),
      prisma.user.count(),
    ])
    res.json({ vehicles, drivers, trips, maintenance, users })
  } catch (err) {
    next(err)
  }
})

app.use(errorHandler)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
setIO(io)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`TransitOps API running on http://localhost:${PORT}`))
