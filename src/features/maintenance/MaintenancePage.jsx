import { useState } from 'react'
import { Plus, Loader2, Wrench, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { apiError } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useMaintenance, useCloseMaintenance } from './api'
import MaintenanceFormModal from './MaintenanceFormModal'

export default function MaintenancePage() {
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager', 'Safety Officer'].includes(user?.role)

  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const { data: records = [], isLoading } = useMaintenance(status ? { status } : undefined)
  const close = useCloseMaintenance()

  const onClose = async (r) => {
    if (!window.confirm(`Close maintenance for ${r.vehicle?.regNumber}? It returns to Available.`)) return
    try {
      await close.mutateAsync(r.id)
    } catch (err) {
      window.alert(apiError(err, 'Could not close record'))
    }
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Service records — opening one moves the vehicle to In Shop; closing restores it."
        actions={
          canManage && (
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} /> Log Service
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`btn-ghost text-sm ${!status ? 'text-brand-600' : 'text-muted'}`} onClick={() => setStatus('')}>All</button>
        <button className={`btn-ghost text-sm ${status === 'Active' ? 'text-brand-600' : 'text-muted'}`} onClick={() => setStatus('Active')}>Active</button>
        <button className={`btn-ghost text-sm ${status === 'Closed' ? 'text-brand-600' : 'text-muted'}`} onClick={() => setStatus('Closed')}>Closed</button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : records.length === 0 ? (
          <EmptyState message="No maintenance records." icon={Wrench} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Opened</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="px-4 py-3 font-medium">{r.vehicle?.regNumber}</td>
                    <td className="px-4 py-3">
                      {r.type}
                      {r.description && <span className="block text-xs text-muted">{r.description}</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(r.cost)}</td>
                    <td className="px-4 py-3">{formatDate(r.openedAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {r.status === 'Active' && (
                            <button className="btn-ghost px-2 text-emerald-600" onClick={() => onClose(r)} title="Close & restore vehicle">
                              <CheckCircle2 size={14} /> Close
                            </button>
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

      <MaintenanceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
