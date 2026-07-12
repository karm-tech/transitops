import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const invalidateAll = (qc) => {
  qc.invalidateQueries({ queryKey: ['trips'] })
  qc.invalidateQueries({ queryKey: ['trip-options'] })
  qc.invalidateQueries({ queryKey: ['vehicles'] })
  qc.invalidateQueries({ queryKey: ['drivers'] })
}

export function useTrips(params) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: async () => (await api.get('/trips', { params })).data,
  })
}

export function useTripOptions(enabled = true) {
  return useQuery({
    queryKey: ['trip-options'],
    queryFn: async () => (await api.get('/trips/options')).data,
    enabled,
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await api.post('/trips', data)).data,
    onSuccess: () => invalidateAll(qc),
  })
}

export function useTripAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, body }) => (await api.post(`/trips/${id}/${action}`, body || {})).data,
    onSuccess: () => invalidateAll(qc),
  })
}
