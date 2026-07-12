import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export const TOKEN_KEY = 'transitops_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turns a field key like "regNumber" / "maxLoadKg" into "Registration Number" / "Max Load Kg".
const humanize = (field) =>
  field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bKg\b/, '(kg)')
    .trim()

export function apiError(err, fallback = 'Something went wrong') {
  const data = err?.response?.data
  // Surface per-field validation messages instead of a generic "Validation failed".
  if (data?.details && typeof data.details === 'object') {
    const parts = Object.entries(data.details)
      .filter(([, msgs]) => msgs && msgs.length)
      .map(([field, msgs]) => `${humanize(field)}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
    if (parts.length) return parts.join(' · ')
  }
  return data?.error || fallback
}
