import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/app/auth'
import { useUsers, useDeleteUser } from './api'
import UserFormModal from './UserFormModal'

export default function UsersPage() {
  const { user: me } = useAuth()
  const { data: users = [], isLoading } = useUsers()
  const del = useDeleteUser()
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  if (me?.role !== 'Admin') return <Navigate to="/dashboard" replace />

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const onDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return
    try {
      await del.mutateAsync(u.id)
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Could not delete user')
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create accounts and assign roles. Roles are assigned only here."
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add User
          </button>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-brand-500" /></div>
        ) : users.length === 0 ? (
          <EmptyState message="No users yet." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="px-4 py-3 font-medium">
                      {u.name}
                      {u.id === me.id && <span className="ml-2 text-xs text-muted">(you)</span>}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="btn-ghost px-2" onClick={() => { setEditing(u); setModalOpen(true) }} aria-label="Edit"><Pencil size={14} /></button>
                        <button className="btn-ghost px-2 text-rose-600 disabled:opacity-30" disabled={u.id === me.id} onClick={() => onDelete(u)} aria-label="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} user={editing} />
    </div>
  )
}
