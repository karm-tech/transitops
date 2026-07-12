import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Upload, FileText, Trash2, Download } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { apiError } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/app/auth'
import { DOCUMENT_TYPES } from '@/lib/constants'
import { useVehicle, useVehicles, useUploadDocument, useDeleteDocument } from './api'

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
  const upload = useUploadDocument(id)
  const del = useDeleteDocument(id)
  const fileRef = useRef(null)
  const [docType, setDocType] = useState('RC')
  const [error, setError] = useState('')

  const index = all.findIndex((v) => v.id === id)
  const prev = index > 0 ? all[index - 1] : null
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-brand-500" /></div>
  if (isError || !vehicle) {
    return <div className="py-24 text-center text-muted">Vehicle not found. <button className="text-brand-600 underline" onClick={() => navigate('/fleet')}>Back to fleet</button></div>
  }

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setError('')
    try {
      await upload.mutateAsync({ file, docType })
      fileRef.current.value = ''
    } catch (err) {
      setError(apiError(err, 'Upload failed'))
    }
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
      </div>

      <div className="card mb-5 grid grid-cols-2 gap-5 p-6 sm:grid-cols-3">
        <Field label="Type">{vehicle.type}</Field>
        <Field label="Capacity">{vehicle.maxLoadKg} kg</Field>
        <Field label="Odometer">{vehicle.odometer.toLocaleString()} km</Field>
        <Field label="Acquisition Cost">{formatCurrency(vehicle.acquisitionCost)}</Field>
        <Field label="Region">{vehicle.region || '—'}</Field>
        <Field label="Registered">{formatDate(vehicle.createdAt)}</Field>
      </div>

      <div className="card mb-5 p-6">
        <h2 className="mb-4 font-medium">Documents</h2>
        {error && <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}
        {canManage && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select className="input w-auto" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input ref={fileRef} type="file" className="text-sm" />
            <button className="btn-primary" onClick={onUpload} disabled={upload.isPending}>
              {upload.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload
            </button>
          </div>
        )}
        {vehicle.documents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No documents attached.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
            {vehicle.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
                <FileText size={16} className="text-brand-500" />
                <span className="w-24 shrink-0 font-medium">{d.docType}</span>
                <span className="flex-1 truncate text-muted">{d.fileName}</span>
                <a href={d.filePath} target="_blank" rel="noreferrer" className="btn-ghost px-2"><Download size={14} /></a>
                {canManage && <button className="btn-ghost px-2 text-rose-600" onClick={() => del.mutate(d.id)}><Trash2 size={14} /></button>}
              </li>
            ))}
          </ul>
        )}
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
