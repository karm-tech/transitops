import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { ROLES } from '@/lib/rbac'
import { useSaveUser } from './api'

const empty = { name: '', email: '', password: '', role: 'Dispatcher', status: 'Active' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function UserFormModal({ open, onClose, user }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: empty })
  const save = useSaveUser()
  const [error, setError] = useState('')
  const isEdit = Boolean(user)

  useEffect(() => {
    reset(user ? { name: user.name, email: user.email, role: user.role, status: user.status } : empty)
    setError('')
  }, [user, open, reset])

  const onSubmit = async (values) => {
    setError('')
    try {
      if (isEdit) {
        await save.mutateAsync({ id: user.id, name: values.name, role: values.role, status: values.status })
      } else {
        await save.mutateAsync(values)
      }
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not save user'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Create User'}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="user-form" disabled={save.isPending}>
            {save.isPending && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block text-sm">
          Full Name <span className="text-rose-500">*</span>
          <input className="input mt-1" {...register('name', { required: 'Name is required' })} />
          <FieldError error={errors.name} />
        </label>
        <label className="block text-sm">
          Email <span className="text-rose-500">*</span>
          <input className="input mt-1" type="email" disabled={isEdit} {...register('email', { required: 'Email is required' })} />
          <FieldError error={errors.email} />
        </label>
        {!isEdit && (
          <label className="block text-sm">
            Temporary Password <span className="text-rose-500">*</span>
            <input className="input mt-1" type="text" placeholder="min 6 characters" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })} />
            <FieldError error={errors.password} />
          </label>
        )}
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            Role <span className="text-rose-500">*</span>
            <select className="input mt-1" {...register('role', { required: true })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select className="input mt-1" {...register('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </form>
    </Modal>
  )
}
