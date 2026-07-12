import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { DRIVER_STATUS, LICENSE_CATEGORIES, labelFor } from '@/lib/constants'
import { useSaveDriver } from './api'

const empty = { name: '', licenseNumber: '', licenseCategory: 'LMV', licenseExpiry: '', contact: '', safetyScore: 100, status: 'Available' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '')

export default function DriverFormModal({ open, onClose, driver }) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({ defaultValues: empty })
  const save = useSaveDriver()
  const [error, setError] = useState('')

  useEffect(() => {
    reset(driver ? { ...driver, contact: driver.contact || '', licenseExpiry: toDateInput(driver.licenseExpiry) } : empty)
    setError('')
  }, [driver, open, reset])

  const onSubmit = async (values) => {
    setError('')
    try {
      await save.mutateAsync(driver ? { id: driver.id, ...values } : values)
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not save driver'))
    }
  }

  // Click outside: save if valid; if you've entered data but it's invalid, keep it open and show errors; if untouched, just close.
  const saveOnBackdrop = handleSubmit(onSubmit, () => { if (!isDirty) onClose() })

  return (
    <Modal
      open={open}
      onClose={onClose}
      onBackdrop={saveOnBackdrop}
      title={driver ? 'Edit Driver' : 'Add Driver'}
      footer={
        <div className="flex flex-1 items-center justify-between">
          <span className="hidden items-center gap-1 text-xs text-muted sm:flex">
            <Save size={12} /> Click outside to auto-save
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
            <button className="btn-primary" form="driver-form" disabled={save.isPending}>
              {save.isPending && <Loader2 size={15} className="animate-spin" />}
              {driver ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <form id="driver-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <label className="col-span-2 text-sm">
          Full Name <span className="text-rose-500">*</span>
          <input className="input mt-1" {...register('name', { required: 'Name is required' })} />
          <FieldError error={errors.name} />
        </label>
        <label className="text-sm">
          License Number <span className="text-rose-500">*</span>
          <input className="input mt-1" placeholder="DL-8825" {...register('licenseNumber', { required: 'License number is required' })} />
          <FieldError error={errors.licenseNumber} />
        </label>
        <label className="text-sm">
          License Category <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('licenseCategory', { required: true })}>
            {LICENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm">
          License Expiry <span className="text-rose-500">*</span>
          <input className="input mt-1" type="date" {...register('licenseExpiry', { required: 'Expiry date is required' })} />
          <FieldError error={errors.licenseExpiry} />
        </label>
        <label className="text-sm">
          Contact
          <input className="input mt-1" placeholder="98765-00000" {...register('contact')} />
        </label>
        <label className="text-sm">
          Safety Score (0–100)
          <input className="input mt-1" type="number" {...register('safetyScore')} />
        </label>
        <label className="text-sm">
          Status
          <select className="input mt-1" {...register('status')}>
            {DRIVER_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
          </select>
        </label>
      </form>
    </Modal>
  )
}
