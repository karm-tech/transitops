import { useState } from 'react'
import { Plus, Loader2, Fuel, Wrench, Receipt, Wallet, Zap } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/app/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFuelLogs, useExpenses, useFinanceSummary } from './api'
import FinanceFormModal from './FinanceFormModal'

function Tile({ label, value, icon: Icon, tone }) {
  return (
    <div className="card p-4">
      <Icon size={18} className={tone} />
      <p className="mt-3 text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

export default function FinancePage() {
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager', 'Financial Analyst'].includes(user?.role)

  const { data: summary } = useFinanceSummary()
  const { data: fuel = [], isLoading: fuelLoading } = useFuelLogs()
  const { data: expenses = [], isLoading: expLoading } = useExpenses()
  const [modal, setModal] = useState(null)

  const totals = summary?.totals || { fuel: 0, maintenance: 0, other: 0, operational: 0 }

  return (
    <div>
      <PageHeader
        title="Fuel & Expenses"
        subtitle="Fuel logs, other expenses, and auto-computed operational cost."
        actions={
          canManage && (
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setModal('expense')}><Plus size={16} /> Add Expense</button>
              <button className="btn-primary" onClick={() => setModal('fuel')}><Plus size={16} /> Log Fuel</button>
            </div>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Operational Cost" value={formatCurrency(totals.operational)} icon={Wallet} tone="text-brand-500" />
        <Tile label="Fuel" value={formatCurrency(totals.fuel)} icon={Fuel} tone="text-blue-500" />
        <Tile label="Maintenance" value={formatCurrency(totals.maintenance)} icon={Wrench} tone="text-amber-500" />
        <Tile label="Other Expenses" value={formatCurrency(totals.other)} icon={Receipt} tone="text-indigo-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-medium">Fuel Logs</h2>
          <div className="card overflow-hidden">
            {fuelLoading ? (
              <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-brand-500" /></div>
            ) : fuel.length === 0 ? (
              <EmptyState message="No fuel logs yet." icon={Fuel} />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted">
                  <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                    <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Litres</th><th className="px-4 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fuel.map((f) => (
                    <tr key={f.id} className="border-b last:border-0" style={{ borderColor: 'rgb(var(--border))' }}>
                      <td className="px-4 py-2.5 font-medium">{f.vehicle?.regNumber}</td>
                      <td className="px-4 py-2.5">
                        {f.tripId ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                            <Zap size={11} /> Auto
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Manual</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">{formatDate(f.date)}</td>
                      <td className="px-4 py-2.5 tabular-nums">{f.liters} L</td>
                      <td className="px-4 py-2.5 tabular-nums">{formatCurrency(f.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-medium">Other Expenses</h2>
          <div className="card overflow-hidden">
            {expLoading ? (
              <div className="grid place-items-center py-12"><Loader2 className="animate-spin text-brand-500" /></div>
            ) : expenses.length === 0 ? (
              <EmptyState message="No expenses yet." icon={Receipt} />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted">
                  <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                    <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b last:border-0" style={{ borderColor: 'rgb(var(--border))' }}>
                      <td className="px-4 py-2.5 font-medium">{e.vehicle?.regNumber}</td>
                      <td className="px-4 py-2.5">{e.category}</td>
                      <td className="px-4 py-2.5 text-muted">{e.note || '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <FinanceFormModal open={Boolean(modal)} onClose={() => setModal(null)} kind={modal} />
    </div>
  )
}
