import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { badRequest, notFound } from '../middleware/error.js'
import { ROLES, DOCUMENT_TYPES } from '../lib/constants.js'

const uploadDir = 'uploads'
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()
const canManage = requireRole(ROLES.FLEET_MANAGER)

router.use(requireAuth)

router.post('/', canManage, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw badRequest('A file is required')
    const { vehicleId, docType } = z
      .object({ vehicleId: z.string().min(1), docType: z.enum(DOCUMENT_TYPES) })
      .parse(req.body)

    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, isDemo: req.isDemo } })
    if (!vehicle) throw notFound('Vehicle not found')

    const doc = await prisma.vehicleDocument.create({
      data: { vehicleId, docType, fileName: req.file.originalname, filePath: `/${uploadDir}/${req.file.filename}`, isDemo: req.isDemo },
    })
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', canManage, async (req, res, next) => {
  try {
    const doc = await prisma.vehicleDocument.findUnique({ where: { id: req.params.id } })
    if (!doc) throw notFound('Document not found')

    const abs = path.join(process.cwd(), doc.filePath.replace(/^\//, ''))
    fs.promises.unlink(abs).catch(() => {})
    await prisma.vehicleDocument.delete({ where: { id: req.params.id } })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
