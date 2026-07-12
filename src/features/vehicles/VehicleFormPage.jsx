import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Save, Plus, FileText, X } from 'lucide-react'
import { api, apiError } from '@/lib/api'
import { useAuth } from '@/app/auth'
import { VEHICLE_STATUS, DOCUMENT_TYPES, labelFor } from '@/lib/constants'
import DocumentManager from '@/components/common/DocumentManager'
import { useVehicle, useSaveVehicle, useVehicleTypes } from './api'

const empty = { regNumber: '', name: '', type: '', maxLoadKg: '', odometer: 0, acquisitionCost: 0, region: '', description: '', status: 'Available' }

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-rose-600">{error.message || 'This field is required'}</p>
}

export default function VehicleFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = ['Admin', 'Fleet Manager'].includes(user?.role)

  const { data: vehicle, isLoading } = useVehicle(id)
  const { data: types = [] } = useVehicleTypes()
  const save = useSaveVehicle()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: empty })
  const [error, setError] = useState('')
  const [staged, setStaged] = useState([])
  const [stageType, setStageType] = useState('RC')
  const fileRef = useRef(null)

  useEffect(() => {
    if (vehicle) reset({ ...vehicle, region: vehicle.region || '', description: vehicle.description || '' })
  }, [vehicle, reset])

  const addStaged = () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setStaged((s) => [...s, { file, docType: stageType }])
    fileRef.current.value = ''
  }

  const onSubmit = async (values) => {
    setError('')
    try {
      const saved = await save.mutateAsync(isEdit ? { id, ...values } : values)
      // Upload any documents staged during creation, now that the vehicle exists.
      for (const doc of staged) {
        const form = new FormData()
        form.append('file', doc.file)
        form.append('vehicleId', saved.id)
        form.append('docType', doc.docType)
        await api.post('/documents', form)
      }
      navigate(isEdit ? `/fleet/${id}` : `/fleet/${saved.id}`)
    } catch (err) {
      setError(apiError(err, 'Could not save vehicle'))
    }
  }

  if (isEdit && isLoading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-brand-500" /></div>

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate('/fleet')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
        <ArrowLeft size={16} /> Fleet
      </button>
      <h1 className="mb-1 text-2xl font-semibold">{isEdit ? `Edit ${vehicle?.regNumber || 'Vehicle'}` : 'Register Vehicle'}</h1>
      <p className="mb-6 text-sm text-muted">Fill in the vehicle details{isEdit ? ' and manage its documents' : ''}.</p>

      {error && <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="card grid grid-cols-2 gap-5 p-6">
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
        <label className="text-sm">
          Status
          <select className="input mt-1" {...register('status')}>
            {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
          </select>
        </label>
        <label className="col-span-2 text-sm">
          Description / Notes
          <textarea className="input mt-1" rows={3} placeholder="Any notes about this vehicle…" {...register('description')} />
        </label>

        <div className="col-span-2 flex justify-end gap-2 border-t pt-4" style={{ borderColor: 'rgb(var(--border))' }}>
          <button type="button" className="btn-ghost" onClick={() => navigate('/fleet')}>Cancel</button>
          <button className="btn-primary" disabled={save.isPending}>
            {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? 'Save Changes' : 'Register Vehicle'}
          </button>
        </div>
      </form>

      {isEdit && vehicle && (
        <div className="card mt-5 p-6">
          <h2 className="mb-4 font-medium">Documents</h2>
          <DocumentManager kind="vehicle" ownerId={vehicle.id} documents={vehicle.documents || []} docTypes={DOCUMENT_TYPES} canManage={canManage} invalidateKey={['vehicles', vehicle.id]} />
        </div>
      )}

      {!isEdit && (
        <div className="card mt-5 p-6">
          <h2 className="mb-1 font-medium">Documents</h2>
          <p className="mb-4 text-xs text-muted">Attach files now — they upload automatically when you register the vehicle.</p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select className="input w-auto" value={stageType} onChange={(e) => setStageType(e.target.value)}>
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input ref={fileRef} type="file" className="text-sm" />
            <button type="button" className="btn-ghost" onClick={addStaged}><Plus size={15} /> Add file</button>
          </div>
          {staged.length > 0 && (
            <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
              {staged.map((d, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-sm">
                  <FileText size={15} className="text-brand-500" />
                  <span className="w-20 shrink-0 font-medium">{d.docType}</span>
                  <span className="flex-1 truncate text-muted">{d.file.name}</span>
                  <button type="button" className="btn-ghost px-2 text-rose-600" onClick={() => setStaged(staged.filter((_, j) => j !== i))}><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
