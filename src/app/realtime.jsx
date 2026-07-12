import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket, REALTIME_EVENTS } from '@/lib/socket'

// Refreshes live data across the app whenever the server emits a change event.
export function RealtimeProvider({ children }) {
  const qc = useQueryClient()

  useEffect(() => {
    const refresh = () => qc.invalidateQueries()
    REALTIME_EVENTS.forEach((event) => socket.on(event, refresh))
    return () => REALTIME_EVENTS.forEach((event) => socket.off(event, refresh))
  }, [qc])

  return children
}
