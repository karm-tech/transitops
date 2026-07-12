import { X } from 'lucide-react'

export default function Modal({ open, onClose, onBackdrop, title, children, footer }) {
  if (!open) return null
  // Clicking the backdrop can trigger a distinct action (e.g. auto-save); falls back to close.
  const handleBackdrop = onBackdrop || onClose
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleBackdrop} />
      <div className="card relative z-10 w-full max-w-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
