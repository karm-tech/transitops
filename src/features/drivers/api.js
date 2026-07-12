import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDrivers(params) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: async () => (await api.get('/drivers', { params })).data,
  })
}

export function useSaveDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) =>
      id ? (await api.patch(`/drivers/${id}`, data)).data : (await api.post('/drivers', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => api.delete(`/drivers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  })
}
