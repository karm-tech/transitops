import { NavLink } from 'react-router-dom'
import { Truck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/auth'
import { visibleNav } from './navItems'

export default function MobileNav({ open, onClose }) {
  const { user } = useAuth()
  if (!open) return null
  const items = visibleNav(user?.role)

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="surface absolute left-0 top-0 flex h-full w-64 flex-col border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white"><Truck size={18} /></div>
            <p className="font-semibold">TransitOps</p>
          </div>
          <button onClick={onClose} className="btn-ghost px-2"><X size={16} /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500/10 text-brand-600' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}
