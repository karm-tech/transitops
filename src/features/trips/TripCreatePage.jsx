import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Loader2, AlertTriangle, Send, FileText, ArrowLeft } from 'lucide-react'
import { apiError } from '@/lib/api'
import { useCreateTrip, useTripOptions } from './api'

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function TripCreatePage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { data: options } = useTripOptions()
  const create = useCreateTrip()
  const [error, setError] = useState('')

  const vehicles = options?.vehicles || []
  const drivers = options?.drivers || []
  const selectedVehicle = vehicles.find((v) => v.id === watch('vehicleId'))
  const selectedDriver = drivers.find((d) => d.id === watch('driverId'))
  const cargo = Number(watch('cargoWeightKg')) || 0
  const overCapacity = selectedVehicle && cargo > selectedVehicle.maxLoadKg
  const canDispatch = selectedVehicle?.eligible && selectedDriver?.eligible && !overCapacity && cargo > 0

  const submit = (dispatch) =>
    handleSubmit(async (values) => {
      setError('')
      try {
        const trip = await create.mutateAsync({ ...values, dispatch })
        navigate(`/trips/${trip.id}`)
      } catch (err) {
        setError(apiError(err, 'Could not create trip'))
      }
    })

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate('/trips')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
        <ArrowLeft size={16} /> Trips
      </button>
      <h1 className="mb-1 text-2xl font-semibold">New Trip</h1>
      <p className="mb-6 text-sm text-muted">Ineligible vehicles and drivers are disabled with the reason. Dispatch is blocked until every rule passes.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <form className="card grid grid-cols-2 gap-5 p-6">
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

        <div className="col-span-2 flex justify-end gap-2 border-t pt-4" style={{ borderColor: 'rgb(var(--border))' }}>
          <button className="btn-ghost" onClick={submit(false)} disabled={create.isPending} type="button">
            <FileText size={15} /> Save Draft
          </button>
          <button className="btn-primary" onClick={submit(true)} disabled={create.isPending || !canDispatch} type="button" title={!canDispatch ? 'Resolve the blocks to dispatch' : ''}>
            {create.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Dispatch
          </button>
        </div>
      </form>
    </div>
  )
}
