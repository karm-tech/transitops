import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { VEHICLE_STATUS, labelFor } from '@/lib/constants'
import { useSaveVehicle, useVehicleTypes } from './api'

const empty = { regNumber: '', name: '', type: '', maxLoadKg: '', odometer: 0, acquisitionCost: 0, region: '', status: 'Available' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function VehicleFormModal({ open, onClose, vehicle }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: empty })
  const { data: types = [] } = useVehicleTypes()
  const save = useSaveVehicle()
  const [error, setError] = useState('')

  useEffect(() => {
    reset(vehicle ? { ...vehicle, region: vehicle.region || '' } : empty)
    setError('')
  }, [vehicle, open, reset])

  const onSubmit = async (values) => {
    setError('')
    try {
      await save.mutateAsync(vehicle ? { id: vehicle.id, ...values } : values)
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not save vehicle'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vehicle ? 'Edit Vehicle' : 'Register Vehicle'}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="vehicle-form" disabled={save.isPending}>
            {save.isPending && <Loader2 size={15} className="animate-spin" />}
            {vehicle ? 'Save Changes' : 'Register'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <label className="col-span-2 text-sm">
          Registration Number <span className="text-rose-500">*</span>
          <input className="input mt-1" placeholder="GJ01-VAN-05" {...register('regNumber', { required: 'Registration number is required' })} />
          <FieldError error={errors.regNumber} />
        </label>
        <label className="text-sm">
          Name / Model <span className="text-rose-500">*</span>
          <input className="input mt-1" {...register('name', { required: 'Name is required' })} />
          <FieldError error={errors.name} />
        </label>
        <label className="text-sm">
          Type <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('type', { required: 'Please choose a type' })}>
            <option value="">Select type…</option>
            {types.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <FieldError error={errors.type} />
        </label>
        <label className="text-sm">
          Max Load (kg) <span className="text-rose-500">*</span>
          <input className="input mt-1" type="number" {...register('maxLoadKg', { required: 'Capacity is required' })} />
          <FieldError error={errors.maxLoadKg} />
        </label>
        <label className="text-sm">
          Odometer (km)
          <input className="input mt-1" type="number" {...register('odometer')} />
        </label>
        <label className="text-sm">
          Acquisition Cost
          <input className="input mt-1" type="number" {...register('acquisitionCost')} />
        </label>
        <label className="text-sm">
          Region
          <input className="input mt-1" placeholder="West" {...register('region')} />
        </label>
        <label className="col-span-2 text-sm">
          Status
          <select className="input mt-1" {...register('status')}>
            {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
          </select>
        </label>
      </form>
    </Modal>
  )
}
