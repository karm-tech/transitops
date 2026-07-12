import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Gauge, Percent, Wallet, TrendingUp, Download, FileText } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { useReports } from './api'
import { downloadReportCsv } from './export'
import ReportPDF from './ReportPDF'

function Tile({ label, value, icon: Icon, tone }) {
  return (
    <div className="card p-4">
      <Icon size={18} className={tone} />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

export default function ReportsPage() {
  const { data } = useReports()
  const m = data?.metrics || {}
  const monthly = (data?.monthlyRevenue || []).map((x) => ({ month: x.month.slice(5), revenue: x.revenue }))
  const topCost = data?.topCostVehicles || []
  const perVehicle = data?.perVehicle || []

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Efficiency, utilization, cost and profitability."
        actions={
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => downloadReportCsv(data, new Date().toLocaleString('en-IN'))} disabled={!perVehicle.length}>
              <Download size={16} /> CSV
            </button>
            {data && (
              <PDFDownloadLink document={<ReportPDF data={data} generatedAt={new Date().toLocaleString('en-IN')} />} fileName="transitops-report.pdf" className="btn-primary">
                {({ loading }) => (<><FileText size={16} /> {loading ? 'Preparing…' : 'PDF'}</>)}
              </PDFDownloadLink>
            )}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Fuel Efficiency" value={`${m.fuelEfficiency ?? '—'} km/L`} icon={Gauge} tone="text-blue-500" />
        <Tile label="Fleet Utilization" value={`${m.fleetUtilization ?? '—'}%`} icon={Percent} tone="text-emerald-500" />
        <Tile label="Operational Cost" value={formatCurrency(m.operationalCost)} icon={Wallet} tone="text-amber-500" />
        <Tile label="Vehicle ROI" value={`${m.vehicleRoi ?? '—'}%`} icon={TrendingUp} tone="text-brand-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-medium">Monthly Revenue</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" width={40} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#d97a2b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-medium">Top Costliest Vehicles</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCost} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis type="category" dataKey="regNumber" fontSize={11} stroke="#94a3b8" width={80} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="operationalCost" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {topCost.map((_, i) => <Cell key={i} fill={['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#6366f1'][i % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 card overflow-hidden">
        <h2 className="border-b px-5 py-3 font-medium" style={{ borderColor: 'rgb(var(--border))' }}>Vehicle ROI</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Revenue</th><th className="px-5 py-3">Fuel</th>
                <th className="px-5 py-3">Maintenance</th><th className="px-5 py-3">Op. Cost</th><th className="px-5 py-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {perVehicle.map((v) => (
                <tr key={v.id} className="border-b last:border-0" style={{ borderColor: 'rgb(var(--border))' }}>
                  <td className="px-5 py-2.5 font-medium">{v.regNumber} · {v.name}</td>
                  <td className="px-5 py-2.5 tabular-nums">{formatCurrency(v.revenue)}</td>
                  <td className="px-5 py-2.5 tabular-nums">{formatCurrency(v.fuelCost)}</td>
                  <td className="px-5 py-2.5 tabular-nums">{formatCurrency(v.maintenanceCost)}</td>
                  <td className="px-5 py-2.5 tabular-nums">{formatCurrency(v.operationalCost)}</td>
                  <td className={`px-5 py-2.5 font-medium tabular-nums ${v.roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{v.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
