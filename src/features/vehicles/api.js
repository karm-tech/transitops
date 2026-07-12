import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useVehicles(params) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: async () => (await api.get('/vehicles', { params })).data,
  })
}

export function useVehicle(id) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => (await api.get(`/vehicles/${id}`)).data,
    enabled: Boolean(id),
  })
}

export function useUploadDocument(vehicleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, docType }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('vehicleId', vehicleId)
      form.append('docType', docType)
      return (await api.post('/documents', form)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', vehicleId] }),
  })
}

export function useDeleteDocument(vehicleId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', vehicleId] }),
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

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => (await api.get('/vehicle-types')).data,
  })
}

export function useSaveType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }) =>
      id ? (await api.patch(`/vehicle-types/${id}`, { name })).data : (await api.post('/vehicle-types', { name })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle-types'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useDeleteType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => api.delete(`/vehicle-types/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}
