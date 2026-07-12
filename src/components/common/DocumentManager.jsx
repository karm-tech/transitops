import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Trash2, Download, Eye, Loader2 } from 'lucide-react'
import { api, apiError } from '@/lib/api'

// Manages document upload / list / delete for either a vehicle or a driver.
export default function DocumentManager({ kind, ownerId, documents = [], docTypes, canManage, invalidateKey }) {
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const [docType, setDocType] = useState(docTypes[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = () => qc.invalidateQueries({ queryKey: invalidateKey })

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append(kind === 'driver' ? 'driverId' : 'vehicleId', ownerId)
      form.append('docType', docType)
      await api.post('/documents', form)
      fileRef.current.value = ''
      refresh()
    } catch (err) {
      setError(apiError(err, 'Upload failed'))
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.fileName}"? This cannot be undone.`)) return
    try {
      await api.delete(kind === 'driver' ? `/documents/driver/${doc.id}` : `/documents/${doc.id}`)
      refresh()
    } catch (err) {
      setError(apiError(err, 'Could not delete'))
    }
  }

  return (
    <div>
      {error && <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}
      {canManage && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {docTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input ref={fileRef} type="file" className="text-sm" />
          <button type="button" className="btn-primary" onClick={onUpload} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload
          </button>
        </div>
      )}
      {documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">No documents attached.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'rgb(var(--border))' }}>
          {documents.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
              <FileText size={16} className="text-brand-500" />
              <span className="w-24 shrink-0 font-medium">{d.docType}</span>
              <span className="flex-1 truncate text-muted">{d.fileName}</span>
              <a href={d.filePath} target="_blank" rel="noreferrer" className="btn-ghost px-2" title="View in new tab"><Eye size={14} /></a>
              <a href={d.filePath} download={d.fileName} className="btn-ghost px-2" title="Download"><Download size={14} /></a>
              {canManage && <button type="button" className="btn-ghost px-2 text-rose-600" onClick={() => onDelete(d)} title="Delete"><Trash2 size={14} /></button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
