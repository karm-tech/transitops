import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useLicenseCheck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post('/notifications/license-check')).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
