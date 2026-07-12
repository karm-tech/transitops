import { verifyToken } from '../lib/auth.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from './error.js'
import { ROLES } from '../lib/constants.js'

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new HttpError(401, 'Authentication required')

    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new HttpError(401, 'Session no longer valid')
    if (user.status === 'Inactive') throw new HttpError(403, 'This account has been deactivated')

    req.user = user
    // Demo sessions see demo data; credential sessions see real (empty) data.
    req.isDemo = Boolean(payload.isDemo)
    next()
  } catch (err) {
    if (err instanceof HttpError) return next(err)
    next(new HttpError(401, 'Invalid or expired token'))
  }
}

export const requireRole = (...roles) => (req, _res, next) => {
  // Admin bypasses every role check.
  if (req.user?.role === ROLES.ADMIN) return next()
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have access to this action'))
  }
  next()
}
