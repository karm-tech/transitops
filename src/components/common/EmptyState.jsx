import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Nothing here yet.', icon: Icon = Inbox }) {
  return (
    <div className="grid place-items-center gap-2 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-brand-600">
        <Icon size={20} />
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}
