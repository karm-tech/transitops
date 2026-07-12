import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/auth'
import { apiError } from '@/lib/api'

const demoRoles = [
  { role: 'Fleet Manager', desc: 'Full fleet, maintenance & operations' },
  { role: 'Dispatcher', desc: 'Create & dispatch trips' },
  { role: 'Safety Officer', desc: 'Driver compliance & licenses' },
  { role: 'Financial Analyst', desc: 'Costs, fuel & profitability' },
]

export default function LoginPage() {
  const { login, demoLogin } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm()
  const [error, setError] = useState('')
  const [demoBusy, setDemoBusy] = useState('')

  const onSubmit = async ({ email, password }) => {
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(apiError(err, 'Invalid email or password'))
    }
  }

  const onDemo = async (role) => {
    setError('')
    setDemoBusy(role)
    try {
      await demoLogin(role)
      navigate('/dashboard')
    } catch (err) {
      setError(apiError(err, 'Demo sign-in failed'))
      setDemoBusy('')
    }
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-500 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <Truck size={20} />
          </div>
          <span className="text-lg font-semibold">TransitOps</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Run your fleet with rules that can't be broken.
          </h1>
          <p className="mt-3 max-w-md text-white/80">
            Vehicles, drivers, trips, maintenance and expenses — one enforced, real-time system.
          </p>
        </div>
        <p className="text-sm text-white/60">Smart Transport Operations Platform</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold">Sign in to your account</h2>
          <p className="mt-1 text-sm text-muted">Enter your credentials to continue.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input className="input" type="email" placeholder="you@transitops.app" {...register('email', { required: true })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input className="input" type="password" placeholder="••••••••" {...register('password', { required: true })} />
            </div>
            <button className="btn-primary w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Sign In
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            OR OPEN THE DEMO
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map(({ role, desc }) => (
              <button
                key={role}
                onClick={() => onDemo(role)}
                disabled={!!demoBusy}
                className="btn-ghost flex-col items-start gap-0.5 px-3 py-2 text-left"
                title={desc}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {demoBusy === role && <Loader2 size={13} className="animate-spin" />}
                  {role}
                </span>
                <span className="text-[11px] text-muted">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
