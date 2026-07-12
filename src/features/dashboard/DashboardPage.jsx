import { Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/utils'

const kpis = [
  { label: 'Active Vehicles', value: '53', icon: Truck, tone: 'text-brand-500' },
  { label: 'Available', value: '42', icon: CheckCircle2, tone: 'text-emerald-500' },
  { label: 'In Maintenance', value: '05', icon: Wrench, tone: 'text-amber-500' },
  { label: 'Active Trips', value: '18', icon: Route, tone: 'text-blue-500' },
  { label: 'Pending Trips', value: '09', icon: Clock, tone: 'text-slate-400' },
  { label: 'Drivers On Duty', value: '26', icon: Users, tone: 'text-indigo-500' },
  { label: 'Fleet Utilization', value: '81%', icon: Gauge, tone: 'text-brand-500' },
]

const statusBreakdown = [
  { label: 'Available', pct: 62, color: 'bg-emerald-500' },
  { label: 'On Trip', pct: 24, color: 'bg-blue-500' },
  { label: 'In Shop', pct: 9, color: 'bg-amber-500' },
  { label: 'Retired', pct: 5, color: 'bg-rose-500' },
]

const filters = ['Vehicle Type', 'Status', 'Region']

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Real-time operational snapshot of your fleet." />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} className="btn-ghost text-sm text-muted">
            {f}: All
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-4">
            <Icon size={18} className={tone} />
            <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-medium">Recent Trips</h2>
          <p className="mb-3 text-xs text-muted">Latest dispatch activity</p>
          <div className="space-y-2 text-sm text-muted">
            <p>Live trip feed connects once the API is wired.</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-medium">Vehicle Status</h2>
          <p className="mb-4 text-xs text-muted">Fleet distribution</p>
          <div className="space-y-3">
            {statusBreakdown.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{label}</span>
                  <span className="text-muted tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
