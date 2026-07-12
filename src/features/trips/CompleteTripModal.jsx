import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { useTripAction } from './api'

export default function CompleteTripModal({ open, onClose, trip }) {
  const { register, handleSubmit, reset } = useForm()
  const action = useTripAction()
  const [error, setError] = useState('')

  useEffect(() => {
    reset({ finalOdometer: '', fuelConsumed: '', revenue: '' })
    setError('')
  }, [open, reset])

  const onSubmit = async (values) => {
    setError('')
    const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''))
    try {
      await action.mutateAsync({ id: trip.id, action: 'complete', body })
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not complete trip'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Complete ${trip?.code || 'Trip'}`}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="complete-form" disabled={action.isPending}>
            {action.isPending && <Loader2 size={15} className="animate-spin" />} Complete Trip
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <p className="mb-4 text-sm text-muted">Capture the trip's final figures. The vehicle and driver return to Available.</p>
      <form id="complete-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-4">
        <label className="text-sm">
          Final Odometer
          <input className="input mt-1" type="number" {...register('finalOdometer')} />
        </label>
        <label className="text-sm">
          Fuel Consumed (L)
          <input className="input mt-1" type="number" step="any" {...register('fuelConsumed')} />
        </label>
        <label className="text-sm">
          Revenue
          <input className="input mt-1" type="number" step="any" {...register('revenue')} />
        </label>
      </form>
    </Modal>
  )
}
