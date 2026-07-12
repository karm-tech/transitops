import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2, Route, Send, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { apiError } from '@/lib/api'
import { TRIP_STATUS, labelFor } from '@/lib/constants'
import { useTrips, useTripAction } from './api'
import CompleteTripModal from './CompleteTripModal'

export default function TripsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canManage = ['Admin', 'Fleet Manager', 'Dispatcher'].includes(user?.role)

  const [status, setStatus] = useState('')
  const [completing, setCompleting] = useState(null)

  const { data: trips = [], isLoading } = useTrips(status ? { status } : undefined)
  const action = useTripAction()

  const run = async (id, act) => {
    try {
      await action.mutateAsync({ id, action: act })
    } catch (err) {
      window.alert(apiError(err, `Could not ${act} trip`))
    }
  }

  return (
    <div>
      <PageHeader
        title="Trip Dispatcher"
        subtitle="Create trips, dispatch with live rule checks, and track them end to end."
        actions={
          canManage && (
            <button className="btn-primary" onClick={() => navigate('/trips/new')}>
              <Plus size={16} /> New Trip
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`btn-ghost text-sm ${!status ? 'text-brand-600' : 'text-muted'}`} onClick={() => setStatus('')}>All</button>
        {TRIP_STATUS.map((s) => (
          <button key={s} className={`btn-ghost text-sm ${status === s ? 'text-brand-600' : 'text-muted'}`} onClick={() => setStatus(s)}>
            {labelFor(s)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : trips.length === 0 ? (
          <EmptyState message="No trips yet — create one to get started." icon={Route} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="px-4 py-3">Trip</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/trips/${t.id}`)} className="cursor-pointer border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="px-4 py-3 font-medium">{t.code}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        {t.source} <ArrowRight size={13} /> {t.destination}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.vehicle?.regNumber}</td>
                    <td className="px-4 py-3">{t.driver?.name}</td>
                    <td className="px-4 py-3 tabular-nums">{t.cargoWeightKg} kg</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {t.status === 'Draft' && (
                            <button className="btn-ghost px-2 text-blue-600" onClick={() => run(t.id, 'dispatch')} title="Dispatch"><Send size={14} /></button>
                          )}
                          {t.status === 'Dispatched' && (
                            <button className="btn-ghost px-2 text-emerald-600" onClick={() => setCompleting(t)} title="Complete"><CheckCircle2 size={14} /></button>
                          )}
                          {(t.status === 'Draft' || t.status === 'Dispatched') && (
                            <button className="btn-ghost px-2 text-rose-600" onClick={() => run(t.id, 'cancel')} title="Cancel"><XCircle size={14} /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CompleteTripModal open={Boolean(completing)} onClose={() => setCompleting(null)} trip={completing} />
    </div>
  )
}
