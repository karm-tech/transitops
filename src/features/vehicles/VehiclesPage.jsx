import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2, Truck, Tag } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { formatCurrency } from '@/lib/utils'
import { VEHICLE_STATUS, labelFor } from '@/lib/constants'
import { useVehicles, useDeleteVehicle, useVehicleTypes } from './api'
import VehicleFormModal from './VehicleFormModal'
import ManageTypesModal from './ManageTypesModal'

export default function VehiclesPage() {
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager'].includes(user?.role)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)

  const params = { ...(search && { search }), ...(status && { status }), ...(type && { type }), sort }
  const { data: vehicles = [], isLoading } = useVehicles(params)
  const { data: types = [] } = useVehicleTypes()
  const del = useDeleteVehicle()

  const typeOptions = types.map((t) => t.name)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (v) => {
    setEditing(v)
    setModalOpen(true)
  }
  const onDelete = async (v) => {
    if (!window.confirm(`Delete ${v.regNumber}?`)) return
    try {
      await del.mutateAsync(v.id)
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Could not delete vehicle')
    }
  }

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Your fleet — registration, capacity, condition and status."
        actions={
          canManage && (
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setTypesOpen(true)}>
                <Tag size={16} /> Manage Types
              </button>
              <button className="btn-primary" onClick={openCreate}>
                <Plus size={16} /> Add Vehicle
              </button>
            </div>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search reg no or model…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="regNumber">Reg No</option>
          <option value="odometer">Odometer</option>
          <option value="acquisitionCost">Cost</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : vehicles.length === 0 ? (
          <EmptyState message="No vehicles match your filters." icon={Truck} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Odometer</th>
                  <th className="px-4 py-3">Acq. Cost</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="px-4 py-3 font-medium">{v.regNumber}</td>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3">{v.type}</td>
                    <td className="px-4 py-3 tabular-nums">{v.maxLoadKg} kg</td>
                    <td className="px-4 py-3 tabular-nums">{v.odometer.toLocaleString()} km</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(v.acquisitionCost)}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost px-2" onClick={() => openEdit(v)} aria-label="Edit"><Pencil size={14} /></button>
                          <button className="btn-ghost px-2 text-rose-600" onClick={() => onDelete(v)} aria-label="Delete"><Trash2 size={14} /></button>
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

      <VehicleFormModal open={modalOpen} onClose={() => setModalOpen(false)} vehicle={editing} />
      <ManageTypesModal open={typesOpen} onClose={() => setTypesOpen(false)} />
    </div>
  )
}
