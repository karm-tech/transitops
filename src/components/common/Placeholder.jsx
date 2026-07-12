import { Hammer } from 'lucide-react'
import PageHeader from './PageHeader'

export default function Placeholder({ title, note }) {
  return (
    <div>
      <PageHeader title={title} subtitle="Coming soon." />
      <div className="card grid place-items-center gap-3 p-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-600">
          <Hammer size={22} />
        </div>
        <p className="text-muted">{note || 'Coming soon.'}</p>
      </div>
    </div>
  )
}
