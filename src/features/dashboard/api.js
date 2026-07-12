import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboard(params) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: async () => (await api.get('/dashboard', { params })).data,
  })
}
