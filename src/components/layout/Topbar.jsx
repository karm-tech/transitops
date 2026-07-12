import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Plus, Truck, LogOut, Menu, User, ChevronDown } from 'lucide-react'
import { useTheme } from '@/app/theme'
import { useAuth } from '@/app/auth'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'

export default function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('')

  const go = (path) => {
    setMenuOpen(false)
    navigate(path)
  }
  const onLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="surface flex items-center gap-3 border-b px-4 py-3">
      <button onClick={onMenu} className="btn-ghost px-2 md:hidden" aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2 md:hidden">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
          <Truck size={18} />
        </div>
        <span className="font-semibold">TransitOps</span>
      </div>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <button onClick={toggle} className="btn-ghost px-2.5" aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="btn-primary" onClick={() => navigate('/trips/new')}>
          <Plus size={16} />
          <span className="hidden sm:inline">Dispatch New</span>
        </button>

        <div className="relative ml-1 hidden sm:block" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border-l py-1 pl-3 pr-2 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'rgb(var(--border))' }}
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-600">{initials}</div>
            <div className="leading-tight text-left">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-[11px] text-muted">{user?.role}</p>
            </div>
            <ChevronDown size={15} className={`text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="card absolute right-0 z-50 mt-2 w-44 overflow-hidden p-1">
              <button onClick={() => go('/profile')} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                <User size={15} className="text-muted" /> Profile
              </button>
              <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-500/10">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
