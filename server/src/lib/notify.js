import { prisma } from './prisma.js'
import { emitEvent } from './realtime.js'

// Records an in-app notification and pushes it live to connected clients.
export async function notify(type, message) {
  const n = await prisma.notification.create({ data: { type, message } })
  emitEvent('notifications:new', { id: n.id })
  return n
}
