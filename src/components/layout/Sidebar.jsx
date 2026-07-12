import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="surface hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
          <Truck size={18} />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">TransitOps</p>
          <p className="text-[11px] text-muted">Transport Operations</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/10 text-brand-600'
                  : 'text-muted hover:bg-black/5 dark:hover:bg-white/5',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
