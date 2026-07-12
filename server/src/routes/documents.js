import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { badRequest, notFound } from '../middleware/error.js'
import { ROLES } from '../lib/constants.js'

const uploadDir = 'uploads'
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()
// Fleet Managers manage vehicle docs; Safety Officers also manage driver (licence) docs.
const canManage = requireRole(ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER)

router.use(requireAuth)

const bodySchema = z.object({
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  docType: z.string().min(1),
})

router.post('/', canManage, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw badRequest('A file is required')
    const { vehicleId, driverId, docType } = bodySchema.parse(req.body)
    const filePath = `/${uploadDir}/${req.file.filename}`
    const fileName = req.file.originalname

    if (driverId) {
      const driver = await prisma.driver.findFirst({ where: { id: driverId, isDemo: req.isDemo } })
      if (!driver) throw notFound('Driver not found')
      const doc = await prisma.driverDocument.create({ data: { driverId, docType, fileName, filePath, isDemo: req.isDemo } })
      return res.status(201).json(doc)
    }

    if (!vehicleId) throw badRequest('A vehicle or driver is required')
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, isDemo: req.isDemo } })
    if (!vehicle) throw notFound('Vehicle not found')
    const doc = await prisma.vehicleDocument.create({ data: { vehicleId, docType, fileName, filePath, isDemo: req.isDemo } })
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
})

async function removeFile(filePath) {
  const abs = path.join(process.cwd(), filePath.replace(/^\//, ''))
  await fs.promises.unlink(abs).catch(() => {})
}

router.delete('/:id', canManage, async (req, res, next) => {
  try {
    const doc = await prisma.vehicleDocument.findUnique({ where: { id: req.params.id } })
    if (!doc) throw notFound('Document not found')
    await removeFile(doc.filePath)
    await prisma.vehicleDocument.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.delete('/driver/:id', canManage, async (req, res, next) => {
  try {
    const doc = await prisma.driverDocument.findUnique({ where: { id: req.params.id } })
    if (!doc) throw notFound('Document not found')
    await removeFile(doc.filePath)
    await prisma.driverDocument.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
