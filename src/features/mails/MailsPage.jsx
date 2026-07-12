import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Mail, PartyPopper, IdCard, ChevronDown } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const typeMeta = {
  welcome: { icon: PartyPopper, label: 'Welcome', tone: 'text-emerald-500' },
  license: { icon: IdCard, label: 'Licence', tone: 'text-amber-500' },
}

export default function MailsPage() {
  const { data: mails = [], isLoading } = useQuery({ queryKey: ['mails'], queryFn: async () => (await api.get('/mails')).data })
  const [openId, setOpenId] = useState(null)

  return (
    <div>
      <PageHeader title="Sent Mails" subtitle="Automated emails sent by the system — welcome messages and licence reminders." />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : mails.length === 0 ? (
          <EmptyState message="No emails sent yet. Sign up a user or run a licence check to trigger one." icon={Mail} />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
            {mails.map((m) => {
              const meta = typeMeta[m.type] || { icon: Mail, label: m.type, tone: 'text-brand-500' }
              const Icon = meta.icon
              const open = openId === m.id
              return (
                <li key={m.id}>
                  <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setOpenId(open ? null : m.id)}>
                    <Icon size={16} className={`shrink-0 ${meta.tone}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.subject}</p>
                      <p className="truncate text-xs text-muted">to {m.to} · {formatDate(m.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.status === 'sent' ? 'bg-emerald-500/15 text-emerald-600' : m.status === 'failed' ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-500/15 text-slate-500'}`}>
                      {m.status}
                    </span>
                    <ChevronDown size={15} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="border-t px-4 py-3 text-sm text-muted" style={{ borderColor: 'rgb(var(--border))' }}>
                      {m.body}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
