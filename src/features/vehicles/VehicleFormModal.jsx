import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { VEHICLE_STATUS, VEHICLE_TYPES, labelFor } from '@/lib/constants'
import { useSaveVehicle } from './api'

const empty = { regNumber: '', name: '', type: 'Van', maxLoadKg: '', odometer: 0, acquisitionCost: 0, region: '', status: 'Available' }

export default function VehicleFormModal({ open, onClose, vehicle }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: empty })
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
          Registration Number
          <input className="input mt-1" placeholder="GJ01-VAN-05" {...register('regNumber', { required: true })} />
        </label>
        <label className="text-sm">
          Name / Model
          <input className="input mt-1" {...register('name', { required: true })} />
        </label>
        <label className="text-sm">
          Type
          <input className="input mt-1" list="vehicle-types" placeholder="Van, Truck, or a new type…" {...register('type', { required: true })} />
          <datalist id="vehicle-types">
            {VEHICLE_TYPES.map((t) => <option key={t} value={t} />)}
          </datalist>
        </label>
        <label className="text-sm">
          Max Load (kg)
          <input className="input mt-1" type="number" {...register('maxLoadKg', { required: true })} />
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
