import { useState } from 'react'
import { Check, ShieldCheck, Bell } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { api } from '@/lib/api'
import { MODULES, accessFor, ROLE_DESCRIPTION } from '@/lib/rbac'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  if (!user) return null

  const toggleNotify = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/preferences', { notifyEnabled: !user.notifyEnabled })
      updateUser(data.user)
    } finally {
      setSaving(false)
    }
  }

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  const allowed = accessFor(user.role)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="Your account and what you're allowed to do." />

      <div className="card mb-5 flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-500/15 text-xl font-semibold text-brand-600">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{user.name}</h2>
            <StatusBadge status={user.status} />
          </div>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-600">
            <ShieldCheck size={12} /> {user.role}
          </span>
        </div>
      </div>

      <div className="card mb-5 flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/10 text-brand-600"><Bell size={16} /></span>
          <div>
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted">Receive in-app alerts for trips, maintenance and licences.</p>
          </div>
        </div>
        <button
          onClick={toggleNotify}
          disabled={saving}
          className={`relative h-6 w-11 rounded-full transition-colors ${user.notifyEnabled ? 'bg-brand-500' : 'bg-black/15 dark:bg-white/20'}`}
          aria-label="Toggle notifications"
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${user.notifyEnabled ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="card p-5">
        <h3 className="font-medium">Your Access &amp; Permissions</h3>
        <p className="mb-4 text-sm text-muted">{ROLE_DESCRIPTION[user.role]}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(MODULES).map(([key, label]) => {
            const has = allowed.includes(key)
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${has ? '' : 'opacity-40'}`}
                style={{ borderColor: 'rgb(var(--border))' }}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full ${has ? 'bg-emerald-500/15 text-emerald-600' : 'bg-black/5 text-muted dark:bg-white/10'}`}>
                  {has && <Check size={13} />}
                </span>
                {label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
