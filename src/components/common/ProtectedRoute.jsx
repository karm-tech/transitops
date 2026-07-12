import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/app/auth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid h-full place-items-center">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
