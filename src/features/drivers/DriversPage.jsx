import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Loader2, Users, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { formatDate, licenseState, cn } from '@/lib/utils'
import { DRIVER_STATUS, labelFor } from '@/lib/constants'
import { useDrivers, useDeleteDriver } from './api'
import DriverFormModal from './DriverFormModal'

const licenseStyles = {
  expired: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  expiring: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  valid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  unknown: 'bg-slate-500/15 text-slate-500',
}

function LicenseCell({ expiry }) {
  const state = licenseState(expiry)
  return (
    <div className="flex flex-col gap-0.5">
      <span>{formatDate(expiry)}</span>
      <span className={cn('inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', licenseStyles[state.level])}>
        {state.level === 'expired' && <AlertTriangle size={11} />}
        {state.label}
      </span>
    </div>
  )
}

export default function DriversPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canManage = ['Admin', 'Fleet Manager', 'Safety Officer'].includes(user?.role)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const params = { ...(search && { search }), ...(status && { status }), sort }
  const { data: drivers = [], isLoading } = useDrivers(params)
  const del = useDeleteDriver()

  const onDelete = async (d) => {
    if (!window.confirm(`Delete ${d.name}?`)) return
    try {
      await del.mutateAsync(d.id)
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Could not delete driver')
    }
  }

  return (
    <div>
      <PageHeader
        title="Drivers & Safety"
        subtitle="Driver profiles, licence compliance and safety scores."
        actions={
          canManage && (
            <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>
              <Plus size={16} /> Add Driver
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search name or licence no…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {DRIVER_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="safetyScore">Safety Score</option>
          <option value="licenseExpiry">Licence Expiry</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : drivers.length === 0 ? (
          <EmptyState message="No drivers match your filters." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Licence No</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Licence Expiry</th>
                  <th className="px-4 py-3">Safety</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} onClick={() => navigate(`/drivers/${d.id}`)} className="cursor-pointer border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="px-4 py-3 font-medium">
                      {d.name}
                      {d.contact && <span className="block text-xs font-normal text-muted">{d.contact}</span>}
                    </td>
                    <td className="px-4 py-3">{d.licenseNumber}</td>
                    <td className="px-4 py-3">{d.licenseCategory}</td>
                    <td className="px-4 py-3"><LicenseCell expiry={d.licenseExpiry} /></td>
                    <td className="px-4 py-3 tabular-nums">{d.safetyScore}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost px-2" onClick={() => { setEditing(d); setModalOpen(true) }} aria-label="Edit"><Pencil size={14} /></button>
                          <button className="btn-ghost px-2 text-rose-600" onClick={() => onDelete(d)} aria-label="Delete"><Trash2 size={14} /></button>
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

      <DriverFormModal open={modalOpen} onClose={() => setModalOpen(false)} driver={editing} />
    </div>
  )
}
