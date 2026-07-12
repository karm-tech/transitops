import { prisma } from './prisma.js'
import { emitEvent } from './realtime.js'

// Records an in-app notification (scoped to the demo/real context) and pushes it live.
export async function notify(type, message, isDemo = false) {
  const n = await prisma.notification.create({ data: { type, message, isDemo } })
  emitEvent('notifications:new', { id: n.id })
  return n
}
