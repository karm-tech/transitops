import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Draft', 'Dispatched', 'Completed']

export default function TripStatusStepper({ status }) {
  const cancelled = status === 'Cancelled'
  const currentIndex = cancelled ? -1 : STEPS.indexOf(status)

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white">
          <X size={14} />
        </span>
        Trip cancelled — vehicle and driver were released.
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors',
                  done && 'bg-brand-500 text-white',
                  active && 'bg-brand-500 text-white ring-4 ring-brand-500/20',
                  !done && !active && 'bg-black/10 text-muted dark:bg-white/10',
                )}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span className={cn('text-xs', active ? 'font-medium text-brand-600' : 'text-muted')}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mx-1 h-0.5 flex-1 rounded', i < currentIndex ? 'bg-brand-500' : 'bg-black/10 dark:bg-white/10')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
