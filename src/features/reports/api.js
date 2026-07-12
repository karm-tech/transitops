import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => (await api.get('/reports')).data,
  })
}
