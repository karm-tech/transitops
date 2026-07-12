import { useEffect, useState } from 'react'
import { Loader2, Save, Check } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { useAuth } from '@/app/auth'
import { apiError } from '@/lib/api'
import { MODULES, ROLES } from '@/lib/rbac'
import { useSettings, useSaveGeneral, useSaveRbac } from './api'

const moduleKeys = Object.keys(MODULES)

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const { data } = useSettings()
  const saveGeneral = useSaveGeneral()
  const saveRbac = useSaveRbac()

  const [general, setGeneral] = useState({ depotName: '', currency: 'INR', distanceUnit: 'km' })
  const [matrix, setMatrix] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (data) {
      setGeneral({ depotName: data.depotName, currency: data.currency, distanceUnit: data.distanceUnit })
      setMatrix(data.rbacMatrix || {})
    }
  }, [data])

  const onSaveGeneral = async () => {
    setError('')
    try {
      await saveGeneral.mutateAsync(general)
    } catch (err) {
      setError(apiError(err, 'Could not save settings'))
    }
  }

  const toggle = (role, key) => {
    if (role === 'Admin') return
    setMatrix((m) => {
      const has = (m[role] || []).includes(key)
      return { ...m, [role]: has ? m[role].filter((k) => k !== key) : [...(m[role] || []), key] }
    })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" subtitle="Organization configuration and role-based access." />
      {!isAdmin && <div className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">View only — settings can be changed by an Admin.</div>}
      {error && <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="card mb-6 p-6">
        <h2 className="mb-4 font-medium">General</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label className="text-sm">
            Depot Name
            <input className="input mt-1" disabled={!isAdmin} value={general.depotName} onChange={(e) => setGeneral({ ...general, depotName: e.target.value })} />
          </label>
          <label className="text-sm">
            Currency
            <select className="input mt-1" disabled={!isAdmin} value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })}>
              {['INR', 'USD', 'EUR'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Distance Unit
            <select className="input mt-1" disabled={!isAdmin} value={general.distanceUnit} onChange={(e) => setGeneral({ ...general, distanceUnit: e.target.value })}>
              {['km', 'mi'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
        </div>
        {isAdmin && (
          <button className="btn-primary mt-4" onClick={onSaveGeneral} disabled={saveGeneral.isPending}>
            {saveGeneral.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'rgb(var(--border))' }}>
          <div>
            <h2 className="font-medium">Role-Based Access (RBAC)</h2>
            <p className="text-xs text-muted">Which modules each role can access. Admin always has full access.</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => saveRbac.mutate(matrix)} disabled={saveRbac.isPending}>
              {saveRbac.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Matrix
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="px-6 py-3">Role</th>
                {moduleKeys.map((k) => <th key={k} className="px-2 py-3 text-center">{MODULES[k]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className="border-b last:border-0" style={{ borderColor: 'rgb(var(--border))' }}>
                  <td className="px-6 py-3 font-medium">{role}</td>
                  {moduleKeys.map((key) => {
                    const on = role === 'Admin' || (matrix[role] || []).includes(key)
                    return (
                      <td key={key} className="px-2 py-3 text-center">
                        <button
                          onClick={() => isAdmin && toggle(role, key)}
                          disabled={!isAdmin || role === 'Admin'}
                          className={`mx-auto grid h-5 w-5 place-items-center rounded ${on ? 'bg-brand-500 text-white' : 'bg-black/10 dark:bg-white/10'} ${isAdmin && role !== 'Admin' ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          {on && <Check size={13} />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
