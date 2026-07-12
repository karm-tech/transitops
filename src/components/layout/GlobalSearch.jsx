import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Truck, Users, Route, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'

const groups = [
  { key: 'vehicles', label: 'Vehicles', icon: Truck, to: (id) => `/fleet/${id}` },
  { key: 'drivers', label: 'Drivers', icon: Users, to: (id) => `/drivers/${id}` },
  { key: 'trips', label: 'Trips', icon: Route, to: (id) => `/trips/${id}` },
]

export default function GlobalSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: async () => (await api.get('/search', { params: { q } })).data,
    enabled: q.trim().length > 0,
    staleTime: 10000,
  })

  const results = data || { vehicles: [], drivers: [], trips: [] }
  const total = results.vehicles.length + results.drivers.length + results.trips.length

  const go = (to) => {
    navigate(to)
    setQ('')
    setOpen(false)
  }

  return (
    <div className="relative hidden flex-1 sm:block sm:max-w-md" ref={ref}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        className="input pl-9"
        placeholder="Search vehicles, drivers, trips…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />

      {open && q.trim() && (
        <div className="card absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto p-0">
          {isFetching && total === 0 ? (
            <div className="grid place-items-center py-6"><Loader2 size={18} className="animate-spin text-brand-500" /></div>
          ) : total === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No matches for “{q}”.</p>
          ) : (
            groups.map(({ key, label, icon: Icon, to }) =>
              results[key].length ? (
                <div key={key}>
                  <p className="px-3 pt-2 text-[11px] font-medium uppercase text-muted">{label}</p>
                  {results[key].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => go(to(item.id))}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    >
                      <Icon size={15} className="shrink-0 text-brand-500" />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{item.label}</span>
                        <span className="block truncate text-xs text-muted">{item.sub}</span>
                      </span>
                      <StatusBadge status={item.status} />
                    </button>
                  ))}
                </div>
              ) : null,
            )
          )}
        </div>
      )}
    </div>
  )
}
