import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useVehicles(params) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: async () => (await api.get('/vehicles', { params })).data,
  })
}

export function useSaveVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) =>
      id ? (await api.patch(`/vehicles/${id}`, data)).data : (await api.post('/vehicles', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => api.delete(`/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}
