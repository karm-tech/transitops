import { useEffect, useRef, useState } from 'react'
import { Bell, Route, Wrench, IdCard, CheckCheck } from 'lucide-react'
import { useAuth } from '@/app/auth'
import { useNotifications, useMarkAllRead, useLicenseCheck } from '@/features/notifications/api'

const icons = { trip: Route, maintenance: Wrench, license: IdCard }

function timeAgo(date) {
  const mins = Math.round((Date.now() - new Date(date)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { data } = useNotifications()
  const markAll = useMarkAllRead()
  const licenseCheck = useLicenseCheck()

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user?.notifyEnabled) return null

  const items = data?.items || []
  const unread = data?.unread || 0
  const canCheck = ['Admin', 'Fleet Manager', 'Safety Officer'].includes(user?.role)

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-ghost relative px-2.5" aria-label="Notifications">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-80 p-0">
          <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: 'rgb(var(--border))' }}>
            <span className="text-sm font-medium">Notifications</span>
            <button className="text-xs text-brand-600 hover:underline disabled:opacity-40" onClick={() => markAll.mutate()} disabled={!unread}>
              <CheckCheck size={12} className="mr-1 inline" /> Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">You're all caught up.</p>
            ) : (
              items.map((n) => {
                const Icon = icons[n.type] || Bell
                return (
                  <div key={n.id} className={`flex gap-3 border-b px-4 py-2.5 last:border-0 ${n.read ? '' : 'bg-brand-500/[0.04]'}`} style={{ borderColor: 'rgb(var(--border))' }}>
                    <Icon size={15} className="mt-0.5 shrink-0 text-brand-500" />
                    <div className="min-w-0">
                      <p className="text-sm">{n.message}</p>
                      <p className="text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {canCheck && (
            <button className="w-full border-t px-4 py-2 text-xs text-brand-600 hover:underline" style={{ borderColor: 'rgb(var(--border))' }} onClick={() => licenseCheck.mutate()} disabled={licenseCheck.isPending}>
              Run licence-expiry check
            </button>
          )}
        </div>
      )}
    </div>
  )
}
