import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { apiError } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/app/auth'
import TripStatusStepper from './TripStatusStepper'
import CompleteTripModal from './CompleteTripModal'
import { useTrip, useTripAction, useTrips } from './api'

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{children}</p>
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager', 'Dispatcher'].includes(user?.role)
  const { data: trip, isLoading, isError } = useTrip(id)
  const { data: allTrips = [] } = useTrips()
  const action = useTripAction()
  const [completing, setCompleting] = useState(false)

  const index = allTrips.findIndex((t) => t.id === id)
  const prev = index > 0 ? allTrips[index - 1] : null
  const next = index >= 0 && index < allTrips.length - 1 ? allTrips[index + 1] : null

  const run = async (act) => {
    try {
      await action.mutateAsync({ id, action: act })
    } catch (err) {
      window.alert(apiError(err, `Could not ${act} trip`))
    }
  }

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-brand-500" /></div>
  }
  if (isError || !trip) {
    return (
      <div className="py-24 text-center text-muted">
        Trip not found. <button className="text-brand-600 underline" onClick={() => navigate('/trips')}>Back to trips</button>
      </div>
    )
  }

  const finished = trip.status === 'Completed'
  const canAct = canManage && (trip.status === 'Draft' || trip.status === 'Dispatched')

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate('/trips')} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
          <ArrowLeft size={16} /> Trips
        </button>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!prev} onClick={() => prev && navigate(`/trips/${prev.id}`)} title="Previous trip">
            <ChevronLeft size={16} /> Prev
          </button>
          <button className="btn-ghost px-2 disabled:opacity-30" disabled={!next} onClick={() => next && navigate(`/trips/${next.id}`)} title="Next trip">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{trip.code}</h1>
          <StatusBadge status={trip.status} />
        </div>
        {canAct && (
          <div className="flex gap-2">
            <button className="btn-ghost text-rose-600" onClick={() => run('cancel')} disabled={action.isPending}>
              <XCircle size={15} /> Cancel
            </button>
            {trip.status === 'Draft' && (
              <button className="btn-primary" onClick={() => run('dispatch')} disabled={action.isPending}>
                {action.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Dispatch
              </button>
            )}
            {trip.status === 'Dispatched' && (
              <button className="btn-primary" onClick={() => setCompleting(true)}>
                <CheckCircle2 size={15} /> Complete Trip
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card mb-5 p-6">
        <TripStatusStepper status={trip.status} />
      </div>

      <div className="card p-6">
        <div className="mb-5 rounded-lg border p-3" style={{ borderColor: 'rgb(var(--border))' }}>
          <p className="text-xs uppercase text-muted">Route</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-medium">
            {trip.source} <ArrowRight size={18} className="text-brand-500" /> {trip.destination}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Field label="Vehicle">{trip.vehicle?.regNumber} · {trip.vehicle?.name}</Field>
          <Field label="Driver">{trip.driver?.name} · {trip.driver?.licenseNumber}</Field>
          <Field label="Cargo">{trip.cargoWeightKg} kg</Field>
          <Field label="Planned Distance">{trip.plannedDistanceKm} km</Field>
          <Field label="Created">{formatDate(trip.createdAt)}</Field>
          <Field label="Dispatched">{trip.dispatchedAt ? formatDate(trip.dispatchedAt) : '—'}</Field>
        </div>

        {finished && (
          <div className="mt-6 grid grid-cols-3 gap-5 rounded-lg bg-emerald-500/5 p-4">
            <Field label="Final Odometer">{trip.finalOdometer?.toLocaleString() || '—'} km</Field>
            <Field label="Fuel Consumed">{trip.fuelConsumed ?? '—'} L</Field>
            <Field label="Revenue">{trip.revenue != null ? formatCurrency(trip.revenue) : '—'}</Field>
          </div>
        )}
      </div>

      <CompleteTripModal open={completing} onClose={() => setCompleting(false)} trip={trip} />
    </div>
  )
}
