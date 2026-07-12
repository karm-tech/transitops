import { Link, Navigate } from 'react-router-dom'
import {
  Truck,
  Users,
  Route as RouteIcon,
  ShieldCheck,
  Fuel,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/app/auth'

const features = [
  { icon: Truck, title: 'Fleet Registry', desc: 'Vehicles with unique registration, capacity, odometer and lifecycle status.' },
  { icon: Users, title: 'Driver Compliance', desc: 'Licence category, expiry and safety score — checked before every trip.' },
  { icon: ShieldCheck, title: 'Smart Dispatch Guard', desc: 'Blocks invalid trips and explains exactly which rule failed.' },
  { icon: Fuel, title: 'Auto Fuel Logging', desc: 'Completing a trip logs fuel automatically and keeps costs in sync.' },
  { icon: RouteIcon, title: 'Trip Lifecycle', desc: 'Draft → Dispatched → Completed, with vehicle and driver status auto-managed.' },
  { icon: BarChart3, title: 'Reports & ROI', desc: 'Fuel efficiency, utilization and vehicle ROI with CSV and PDF export.' },
]

const workflow = ['Vehicle', 'Driver', 'Trip', 'Dispatch', 'Complete', 'Maintenance', 'Reports']

export default function LandingPage() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))' }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
            <Truck size={18} />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">TransitOps</p>
            <p className="text-[11px] text-muted">Transport Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/login" className="btn-primary">
            <Sparkles size={16} /> Live demo
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
          style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(217,122,43,0.14), transparent 70%)' }}
        />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-muted" style={{ borderColor: 'rgb(var(--border))' }}>
              <Sparkles size={13} className="text-brand-500" /> Smart Transport Operations Platform
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Run your fleet from <span className="text-brand-500">dispatch to reports</span>, with rules that can't be broken.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted">
              Vehicles, drivers, trips, maintenance and expenses — one enforced, real-time system that keeps
              every dispatch compliant and every cost accounted for.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/login" className="btn-primary px-5 py-2.5 text-base">
                Open the live demo <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-ghost px-5 py-2.5 text-base">Sign in</Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
              {workflow.map((w, i) => (
                <span key={w} className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">{w}</span>
                  {i < workflow.length - 1 && <ArrowRight size={12} className="text-muted" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className="card animate-fade-in p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                <f.icon size={20} />
              </span>
              <h3 className="mt-3 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div
          className="overflow-hidden rounded-3xl p-10 text-center text-white"
          style={{
            backgroundColor: '#d97a2b',
            backgroundImage:
              'radial-gradient(at 80% 0%, rgba(234,173,99,0.55), transparent 50%), linear-gradient(135deg,#a04d1f,#d97a2b)',
          }}
        >
          <h2 className="font-serif text-3xl font-semibold">See the full workflow in action</h2>
          <p className="mx-auto mt-2 max-w-md text-white/80">
            Open the demo — no signup needed. Pre-loaded with a sample fleet, drivers, trips, maintenance and expenses.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-white/90"
          >
            <Sparkles size={16} /> Open the live demo
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted" style={{ borderColor: 'rgb(var(--border))' }}>
        TransitOps · Smart Transport Operations Platform
      </footer>
    </div>
  )
}
