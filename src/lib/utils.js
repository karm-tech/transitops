import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Classifies a licence expiry date for the compliance UI (drives the R3 story).
export function licenseState(expiry) {
  if (!expiry) return { level: 'unknown', label: 'Unknown' }
  const days = Math.ceil((new Date(expiry) - new Date()) / 86400000)
  if (days < 0) return { level: 'expired', label: 'Expired' }
  if (days <= 30) return { level: 'expiring', label: `Expires in ${days}d` }
  return { level: 'valid', label: 'Valid' }
}

