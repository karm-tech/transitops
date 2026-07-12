import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/app/auth'
import { DOCUMENT_TYPES } from '@/lib/constants'
import DocumentManager from '@/components/common/DocumentManager'
import { useVehicle, useVehicles } from './api'

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{children}</p>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager'].includes(user?.role)
  const { data: vehicle, isLoading, isError } = useVehicle(id)
  const { data: all = [] } = useVehicles()

  const index = all.findIndex((v) => v.id === id)
  const prev = index > 0 ? all[index - 1] : null
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-brand-500" /></div>
  if (isError || !vehicle) {
    return <div className="py-24 text-center text-muted">Vehicle not found. <button className="text-brand-600 underline" onClick={() => navigate('/fleet')}>Back to fleet</button></div>
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate('/fleet')} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
          <ArrowLeft size={16} /> Fleet
        </button>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!prev} onClick={() => prev && navigate(`/fleet/${prev.id}`)}><ChevronLeft size={16} /> Prev</button>
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!next} onClick={() => next && navigate(`/fleet/${next.id}`)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{vehicle.regNumber}</h1>
        <StatusBadge status={vehicle.status} />
        <span className="text-muted">· {vehicle.name}</span>
        {canManage && (
          <button className="btn-ghost ml-auto" onClick={() => navigate(`/fleet/${vehicle.id}/edit`)}>
            <Pencil size={15} /> Edit
          </button>
        )}
      </div>

      <div className="card mb-5 grid grid-cols-2 gap-5 p-6 sm:grid-cols-3">
        <Field label="Type">{vehicle.type}</Field>
        <Field label="Capacity">{vehicle.maxLoadKg} kg</Field>
        <Field label="Odometer">{vehicle.odometer.toLocaleString()} km</Field>
        <Field label="Acquisition Cost">{formatCurrency(vehicle.acquisitionCost)}</Field>
        <Field label="Region">{vehicle.region || '—'}</Field>
        <Field label="Registered">{formatDate(vehicle.createdAt)}</Field>
        {vehicle.description && (
          <div className="col-span-2 sm:col-span-3">
            <p className="text-xs uppercase text-muted">Description / Notes</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm">{vehicle.description}</p>
          </div>
        )}
      </div>

      <div className="card mb-5 p-6">
        <h2 className="mb-4 font-medium">Documents</h2>
        <DocumentManager kind="vehicle" ownerId={vehicle.id} documents={vehicle.documents} docTypes={DOCUMENT_TYPES} canManage={canManage} invalidateKey={['vehicles', vehicle.id]} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 font-medium">Trip History</h2>
          {vehicle.trips.length === 0 ? <p className="text-sm text-muted">No trips.</p> : (
            <ul className="space-y-2 text-sm">
              {vehicle.trips.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <button onClick={() => navigate(`/trips/${t.id}`)} className="truncate text-left hover:text-brand-600">
                    <span className="font-medium">{t.code}</span> <span className="text-muted">· {t.driver?.name}</span>
                  </button>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <h2 className="mb-3 font-medium">Maintenance History</h2>
          {vehicle.maintenance.length === 0 ? <p className="text-sm text-muted">No maintenance records.</p> : (
            <ul className="space-y-2 text-sm">
              {vehicle.maintenance.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <span className="truncate"><span className="font-medium">{m.type}</span> <span className="text-muted">· {formatCurrency(m.cost)}</span></span>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
