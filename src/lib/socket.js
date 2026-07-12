import { io } from 'socket.io-client'

// Same-origin connection; Vite proxies /socket.io to the API in dev.
export const socket = io({ autoConnect: true })

export const REALTIME_EVENTS = [
  'trips:changed',
  'vehicles:changed',
  'drivers:changed',
  'maintenance:changed',
  'finance:changed',
  'notifications:new',
]
