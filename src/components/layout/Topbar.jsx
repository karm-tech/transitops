import { Search, Moon, Sun, Plus, Truck } from 'lucide-react'
import { useTheme } from '@/app/theme'

export default function Topbar() {
  const { theme, toggle } = useTheme()

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
        <button className="btn-primary">
          <Plus size={16} />
          <span className="hidden sm:inline">Dispatch New</span>
        </button>
      </div>
    </header>
  )
}
