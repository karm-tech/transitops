import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: ['fuel'] })
  qc.invalidateQueries({ queryKey: ['expenses'] })
  qc.invalidateQueries({ queryKey: ['finance-summary'] })
}

export function useFuelLogs() {
  return useQuery({ queryKey: ['fuel'], queryFn: async () => (await api.get('/finance/fuel')).data })
}

export function useExpenses() {
  return useQuery({ queryKey: ['expenses'], queryFn: async () => (await api.get('/finance/expenses')).data })
}

export function useFinanceSummary() {
  return useQuery({ queryKey: ['finance-summary'], queryFn: async () => (await api.get('/finance/summary')).data })
}

export function useCreateFuel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await api.post('/finance/fuel', data)).data,
    onSuccess: () => invalidate(qc),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => (await api.post('/finance/expenses', data)).data,
    onSuccess: () => invalidate(qc),
  })
}
