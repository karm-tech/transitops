import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '@/app/auth'

export default function AppShell() {
  const { isDemo } = useAuth()

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {isDemo && (
          <div className="flex items-center justify-center gap-2 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300">
            <Sparkles size={13} />
            You're exploring sample demo data — feel free to try everything.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
