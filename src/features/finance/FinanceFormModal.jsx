import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { useVehicles } from '@/features/vehicles/api'
import { useCreateFuel, useCreateExpense } from './api'

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function FinanceFormModal({ open, onClose, kind }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { data: vehicles = [] } = useVehicles()
  const createFuel = useCreateFuel()
  const createExpense = useCreateExpense()
  const [error, setError] = useState('')
  const isFuel = kind === 'fuel'
  const saving = isFuel ? createFuel : createExpense

  useEffect(() => {
    reset({ vehicleId: '', liters: '', cost: '', amount: '', category: 'Toll', note: '' })
    setError('')
  }, [open, reset])

  const onSubmit = async (values) => {
    setError('')
    try {
      if (isFuel) await createFuel.mutateAsync({ vehicleId: values.vehicleId, liters: values.liters, cost: values.cost })
      else await createExpense.mutateAsync({ vehicleId: values.vehicleId, category: values.category, amount: values.amount, note: values.note })
      onClose()
    } catch (err) {
      setError(apiError(err, 'Could not save'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isFuel ? 'Log Fuel' : 'Add Expense'}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" form="finance-form" disabled={saving.isPending}>
            {saving.isPending && <Loader2 size={15} className="animate-spin" />} Save
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      <form id="finance-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <label className="col-span-2 text-sm">
          Vehicle <span className="text-rose-500">*</span>
          <select className="input mt-1" {...register('vehicleId', { required: 'Select a vehicle' })}>
            <option value="">Select vehicle…</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNumber} · {v.name}</option>)}
          </select>
          <FieldError error={errors.vehicleId} />
        </label>

        {isFuel ? (
          <>
            <label className="text-sm">
              Litres <span className="text-rose-500">*</span>
              <input className="input mt-1" type="number" step="any" {...register('liters', { required: 'Litres is required' })} />
              <FieldError error={errors.liters} />
            </label>
            <label className="text-sm">
              Cost <span className="text-rose-500">*</span>
              <input className="input mt-1" type="number" step="any" {...register('cost', { required: 'Cost is required' })} />
              <FieldError error={errors.cost} />
            </label>
          </>
        ) : (
          <>
            <label className="text-sm">
              Category <span className="text-rose-500">*</span>
              <select className="input mt-1" {...register('category')}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Amount <span className="text-rose-500">*</span>
              <input className="input mt-1" type="number" step="any" {...register('amount', { required: 'Amount is required' })} />
              <FieldError error={errors.amount} />
            </label>
            <label className="col-span-2 text-sm">
              Note
              <input className="input mt-1" {...register('note')} />
            </label>
          </>
        )}
      </form>
    </Modal>
  )
}
