import { useNavigate, Link } from 'react-router-dom'
import { Search, Moon, Sun, Plus, Truck, LogOut } from 'lucide-react'
import { useTheme } from '@/app/theme'
import { useAuth } from '@/app/auth'

export default function Topbar() {
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="surface flex items-center gap-3 border-b px-4 py-3">
      <div className="flex items-center gap-2 md:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
          <Truck size={18} />
        </div>
        <span className="font-semibold">TransitOps</span>
      </div>

      <div className="relative hidden flex-1 sm:block sm:max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-9" placeholder="Search vehicles, drivers, trips…" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={toggle} className="btn-ghost px-2.5" aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="btn-primary" onClick={() => navigate('/trips?new=1')}>
          <Plus size={16} />
          <span className="hidden sm:inline">Dispatch New</span>
        </button>

        <Link to="/profile" className="ml-1 hidden items-center gap-2 rounded-lg border-l pl-3 pr-1 hover:opacity-80 sm:flex" style={{ borderColor: 'rgb(var(--border))' }} title="View profile">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-600">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-[11px] text-muted">{user?.role}</p>
          </div>
        </Link>
        <button onClick={onLogout} className="btn-ghost px-2.5" aria-label="Sign out" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
