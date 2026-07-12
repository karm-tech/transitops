import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export const TOKEN_KEY = 'transitops_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function apiError(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error || fallback
}
