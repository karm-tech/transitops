import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ['maintenance'] })
  qc.invalidateQueries({ queryKey: ['vehicles'] })
}

export function useMaintenance(params) {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: async () => (await api.get('/maintenance', { params })).data,
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await api.post('/maintenance', data)).data,
    onSuccess: () => invalidate(qc),
  })
}

export function useCloseMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => (await api.post(`/maintenance/${id}/close`)).data,
    onSuccess: () => invalidate(qc),
  })
}
