import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-transitops-secret'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const hashPassword = (plain) => bcrypt.hash(plain, 10)
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash)

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: EXPIRES_IN })

export const verifyToken = (token) => jwt.verify(token, SECRET)

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  notifyEnabled: user.notifyEnabled,
})
