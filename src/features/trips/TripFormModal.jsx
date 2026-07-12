import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, AlertTriangle, Send, FileText } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { useCreateTrip, useTripOptions } from './api'

const empty = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function TripFormModal({ open, onClose }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: empty })
  const { data: options } = useTripOptions(open)
  const create = useCreateTrip()
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      reset(empty)
      setError('')
    }
  }, [open, reset])

  const vehicles = options?.vehicles || []
  const drivers = options?.drivers || []
  const vehicleId = watch('vehicleId')
  const driverId = watch('driverId')
  const cargo = Number(watch('cargoWeightKg')) || 0

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const selectedDriver = drivers.find((d) => d.id === driverId)
  const overCapacity = selectedVehicle && cargo > selectedVehicle.maxLoadKg
  const vehicleBlocked = selectedVehicle && !selectedVehicle.eligible
  const driverBlocked = selectedDriver && !selectedDriver.eligible
  const canDispatch = selectedVehicle && selectedDriver && !overCapacity && !vehicleBlocked && !driverBlocked

  const submit = (dispatch) =>
    handleSubmit(async (values) => {
      setError('')
      try {
        await create.mutateAsync({ ...values, dispatch })
        onClose()
      } catch (err) {
        setError(apiError(err, 'Could not create trip'))
      }
    })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Trip"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-ghost" onClick={submit(false)} disabled={create.isPending} type="button">
            <FileText size={15} /> Save Draft
          </button>
          <button className="btn-primary" onClick={submit(true)} disabled={create.isPending || !canDispatch} type="button" title={!canDispatch ? 'Resolve the blocks below to dispatch' : ''}>
            {create.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Dispatch
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <form className="grid grid-cols-2 gap-4">
        <label className="text-sm">
          Source <span className="text-rose-500">*</span>
          <input className="input mt-1" {...register('source', { required: 'Source is required', minLength: { value: 2, message: 'Enter a location' } })} />
          <FieldError error={errors.source} />
        </label>
        <label className="text-sm">
          Destination <span className="text-rose-500">*</span>
          <input className="input mt-1" {...register('destination', { required: 'Destination is required', minLength: { value: 2, message: 'Enter a location' } })} />
          <FieldError error={errors.destination} />
        </label>

        <label className="text-sm">
          Vehicle <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('vehicleId', { required: 'Select a vehicle' })}>
            <option value="">Select vehicle…</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.eligible}>
                {v.label}{v.eligible ? ` (${v.maxLoadKg}kg)` : ` — ${v.reason}`}
              </option>
            ))}
          </select>
          <FieldError error={errors.vehicleId} />
        </label>
        <label className="text-sm">
          Driver <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('driverId', { required: 'Select a driver' })}>
            <option value="">Select driver…</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id} disabled={!d.eligible}>
                {d.label}{d.eligible ? '' : ` — ${d.reason}`}
              </option>
            ))}
          </select>
          <FieldError error={errors.driverId} />
        </label>

        <label className="text-sm">
          Cargo Weight (kg) <span className="text-rose-500">*</span>
          <input className="input mt-1" type="number" {...register('cargoWeightKg', { required: 'Cargo weight is required' })} />
          <FieldError error={errors.cargoWeightKg} />
        </label>
        <label className="text-sm">
          Planned Distance (km) <span className="text-rose-500">*</span>
          <input className="input mt-1" type="number" {...register('plannedDistanceKm', { required: 'Distance is required' })} />
          <FieldError error={errors.plannedDistanceKm} />
        </label>

        {overCapacity && (
          <div className="col-span-2 flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Cargo exceeds {selectedVehicle.label.split(' · ')[0]} capacity by <b>{cargo - selectedVehicle.maxLoadKg}kg</b> — dispatch is blocked (max {selectedVehicle.maxLoadKg}kg).</span>
          </div>
        )}
      </form>
    </Modal>
  )
}
