import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: async () => (await api.get('/settings')).data })
}

export function useSaveGeneral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await api.patch('/settings', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

export function useSaveRbac() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rbacMatrix) => (await api.patch('/settings/rbac', { rbacMatrix })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
