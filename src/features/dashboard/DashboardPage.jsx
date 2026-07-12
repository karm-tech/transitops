import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useVehicleTypes } from '@/features/vehicles/api'
import { VEHICLE_STATUS, labelFor } from '@/lib/constants'
import { useDashboard } from './api'

const STATUS_COLORS = { Available: '#10b981', OnTrip: '#3b82f6', InShop: '#f59e0b', Retired: '#f43f5e' }

export default function DashboardPage() {
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [region, setRegion] = useState('')

  const params = { ...(type && { type }), ...(status && { status }), ...(region && { region }) }
  const { data } = useDashboard(params)
  const { data: types = [] } = useVehicleTypes()

  const k = data?.kpis || {}
  const breakdown = data?.breakdown || {}
  const recent = data?.recentTrips || []
  const regions = data?.regions || []

  const kpis = [
    { label: 'Active Vehicles', value: k.activeVehicles, icon: Truck, tone: 'text-brand-500' },
    { label: 'Available', value: k.availableVehicles, icon: CheckCircle2, tone: 'text-emerald-500' },
    { label: 'In Maintenance', value: k.inMaintenance, icon: Wrench, tone: 'text-amber-500' },
    { label: 'Active Trips', value: k.activeTrips, icon: Route, tone: 'text-blue-500' },
    { label: 'Pending Trips', value: k.pendingTrips, icon: Clock, tone: 'text-slate-400' },
    { label: 'Drivers On Duty', value: k.driversOnDuty, icon: Users, tone: 'text-indigo-500' },
    { label: 'Fleet Utilization', value: k.fleetUtilization != null ? `${k.fleetUtilization}%` : '—', icon: Gauge, tone: 'text-brand-500' },
  ]

  const pieData = Object.entries(breakdown).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Real-time operational snapshot of your fleet." />

      <div className="mb-5 flex flex-wrap gap-2">
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {types.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
        </select>
        <select className="input w-auto" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All Regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-4">
            <Icon size={18} className={tone} />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{value ?? '—'}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-1 font-medium">Recent Trips</h2>
          <p className="mb-3 text-xs text-muted">Latest dispatch activity</p>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No trips yet.</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
              {recent.map((t) => (
                <button key={t.id} onClick={() => navigate(`/trips/${t.id}`)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm hover:opacity-80">
                  <span className="font-medium">{t.code}</span>
                  <span className="flex-1 truncate text-muted">{t.route}</span>
                  <StatusBadge status={t.status} />
                  <ArrowRight size={14} className="text-muted" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-1 font-medium">Vehicle Status</h2>
          <p className="mb-3 text-xs text-muted">Fleet distribution</p>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} isAnimationActive={false}>
                    {pieData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {Object.entries(breakdown).map(([name, value]) => (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[name] }} />
                  <span className="flex-1">{labelFor(name)}</span>
                  <span className="tabular-nums text-muted">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
