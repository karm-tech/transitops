let io = null

export function setIO(instance) {
  io = instance
}

// Broadcast a domain event so connected clients can refresh live (KPIs, lists).
export function emitEvent(event, payload) {
  if (io) io.emit(event, payload)
}
