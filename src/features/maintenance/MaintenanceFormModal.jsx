import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { useVehicles } from '@/features/vehicles/api'
import { useCreateMaintenance } from './api'

const empty = { vehicleId: '', type: '', cost: 0, description: '' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

const blockReason = (v) => {
  if (v.status === 'OnTrip') return 'On a trip'
  if (v.status === 'Retired') return 'Retired'
  return null
}

export default function MaintenanceFormModal({ open, onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: empty })
  const { data: vehicles = [] } = useVehicles()
  const create = useCreateMaintenance()
  const [error, setError] = useState('')

  useEffect(() => {
    reset(empty)
    setError('')
  }, [open, reset])

  const onSubmit = async (values) => {
    setError('')
    try {
      await create.mutateAsync(values)
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not log maintenance'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Service Record"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="maint-form" disabled={create.isPending}>
            {create.isPending && <Loader2 size={15} className="animate-spin" />} Save
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <p className="mb-4 text-sm text-muted">Opening a record moves the vehicle to <b>In Shop</b> and hides it from dispatch.</p>
      <form id="maint-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <label className="col-span-2 text-sm">
          Vehicle <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('vehicleId', { required: 'Select a vehicle' })}>
            <option value="">Select vehicle…</option>
            {vehicles.map((v) => {
              const reason = blockReason(v)
              return (
                <option key={v.id} value={v.id} disabled={Boolean(reason)}>
                  {v.regNumber} · {v.name}{reason ? ` — ${reason}` : ''}
                </option>
              )
            })}
          </select>
          <FieldError error={errors.vehicleId} />
        </label>
        <label className="text-sm">
          Service Type <span className="text-rose-500">*</span>
          <input className="input mt-1" placeholder="Oil Change" {...register('type', { required: 'Service type is required' })} />
          <FieldError error={errors.type} />
        </label>
        <label className="text-sm">
          Cost
          <input className="input mt-1" type="number" step="any" {...register('cost')} />
        </label>
        <label className="col-span-2 text-sm">
          Description
          <textarea className="input mt-1" rows={2} {...register('description')} />
        </label>
      </form>
    </Modal>
  )
}
