import { useState } from 'react'
import { Plus, Trash2, Loader2, Check, X, Pencil } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { apiError } from '@/lib/api'
import { useVehicleTypes, useSaveType, useDeleteType } from './api'

export default function ManageTypesModal({ open, onClose }) {
  const { data: types = [], isLoading } = useVehicleTypes()
  const save = useSaveType()
  const del = useDeleteType()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const add = async () => {
    if (!name.trim()) {
      setError('Type name is required')
      return
    }
    setError('')
    try {
      await save.mutateAsync({ name })
      setName('')
    } catch (err) {
      setError(apiError(err, 'Could not add type'))
    }
  }

  const rename = async (id) => {
    if (!editName.trim()) return
    try {
      await save.mutateAsync({ id, name: editName })
      setEditing(null)
    } catch (err) {
      setError(apiError(err, 'Could not rename type'))
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await del.mutateAsync(id)
    } catch (err) {
      setError(apiError(err, 'Could not delete type'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage Vehicle Types">
      {error && (
        <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          className="input"
          placeholder="New type (e.g. Trailer)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn-primary shrink-0" onClick={add} disabled={save.isPending}>
          {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
        </button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-8"><Loader2 className="animate-spin text-brand-500" /></div>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
          {types.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2">
              {editing === t.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  <button className="btn-ghost px-2 text-emerald-600" onClick={() => rename(t.id)}><Check size={15} /></button>
                  <button className="btn-ghost px-2" onClick={() => setEditing(null)}><X size={15} /></button>
                </div>
              ) : (
                <>
                  <span className="text-sm">{t.name}</span>
                  <div className="flex gap-1">
                    <button className="btn-ghost px-2" onClick={() => { setEditing(t.id); setEditName(t.name) }} aria-label="Rename"><Pencil size={14} /></button>
                    <button className="btn-ghost px-2 text-rose-600" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
