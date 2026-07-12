import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/auth'
import { apiError } from '@/lib/api'

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'Required'}</p>
}

export default function SignupPage() {
  const { register: signup } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  const onSubmit = async (values) => {
    setError('')
    try {
      await signup(values)
      navigate('/dashboard')
    } catch (err) {
      setError(apiError(err, 'Could not create account'))
    }
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-500 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15"><Truck size={20} /></div>
          <span className="text-lg font-semibold">TransitOps</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Create your account.</h1>
          <p className="mt-3 max-w-md text-white/80">Get started with your own fresh workspace — add vehicles, drivers and trips.</p>
        </div>
        <p className="text-sm text-white/60">Smart Transport Operations Platform</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold">Sign up</h2>
          <p className="mt-1 text-sm text-muted">Create an account to build your fleet from scratch.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">First Name</label>
                <input className="input" placeholder="First" {...register('firstName', { required: 'Required' })} />
                <FieldError error={errors.firstName} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Last Name</label>
                <input className="input" placeholder="Last" {...register('lastName', { required: 'Required' })} />
                <FieldError error={errors.lastName} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone Number</label>
              <input className="input" placeholder="98765-43210" {...register('phone')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input className="input" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
              <FieldError error={errors.email} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input className="input" type="password" placeholder="min 6 characters" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })} />
              <FieldError error={errors.password} />
            </div>
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
