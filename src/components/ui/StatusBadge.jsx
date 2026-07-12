import { cn } from '@/lib/utils'

const styles = {
  Available: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  OnTrip: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  InShop: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Retired: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  OffDuty: 'bg-slate-500/15 text-slate-500',
  Suspended: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  Draft: 'bg-slate-500/15 text-slate-500',
  Dispatched: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  Completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  Cancelled: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  Active: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Closed: 'bg-slate-500/15 text-slate-500',
}

const labels = { OnTrip: 'On Trip', InShop: 'In Shop', OffDuty: 'Off Duty' }

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status] || 'bg-slate-500/15 text-slate-500',
      )}
    >
      {labels[status] || status}
    </span>
  )
}
