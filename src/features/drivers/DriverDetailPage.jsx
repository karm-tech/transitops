import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, licenseState, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useDrivers } from './api'

const licenseStyles = {
  expired: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  expiring: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  valid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  unknown: 'bg-slate-500/15 text-slate-500',
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{children}</p>
    </div>
  )
}

export default function DriverDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: driver, isLoading, isError } = useQuery({
    queryKey: ['drivers', id],
    queryFn: async () => (await api.get(`/drivers/${id}`)).data,
    enabled: Boolean(id),
  })
  const { data: all = [] } = useDrivers()

  const index = all.findIndex((d) => d.id === id)
  const prev = index > 0 ? all[index - 1] : null
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-brand-500" /></div>
  if (isError || !driver) {
    return <div className="py-24 text-center text-muted">Driver not found. <button className="text-brand-600 underline" onClick={() => navigate('/drivers')}>Back to drivers</button></div>
  }

  const lic = licenseState(driver.licenseExpiry)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate('/drivers')} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
          <ArrowLeft size={16} /> Drivers
        </button>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!prev} onClick={() => prev && navigate(`/drivers/${prev.id}`)}><ChevronLeft size={16} /> Prev</button>
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!next} onClick={() => next && navigate(`/drivers/${next.id}`)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{driver.name}</h1>
        <StatusBadge status={driver.status} />
      </div>

      <div className="card mb-5 grid grid-cols-2 gap-5 p-6 sm:grid-cols-3">
        <Field label="Licence No">{driver.licenseNumber}</Field>
        <Field label="Category">{driver.licenseCategory}</Field>
        <Field label="Safety Score">{driver.safetyScore}</Field>
        <Field label="Contact">{driver.contact || '—'}</Field>
        <div>
          <p className="text-xs uppercase text-muted">Licence Expiry</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm font-medium">
            {formatDate(driver.licenseExpiry)}
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', licenseStyles[lic.level])}>
              {lic.level === 'expired' && <AlertTriangle size={11} />}{lic.label}
            </span>
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 font-medium">Trip History</h2>
        {driver.trips.length === 0 ? <p className="text-sm text-muted">No trips.</p> : (
          <ul className="space-y-2 text-sm">
            {driver.trips.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2">
                <button onClick={() => navigate(`/trips/${t.id}`)} className="truncate text-left hover:text-brand-600">
                  <span className="font-medium">{t.code}</span> <span className="text-muted">· {t.vehicle?.regNumber} · {t.source} → {t.destination}</span>
                </button>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
