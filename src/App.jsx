import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Placeholder from '@/components/common/Placeholder'
import DashboardPage from '@/features/dashboard/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fleet" element={<Placeholder title="Vehicle Registry" />} />
        <Route path="/drivers" element={<Placeholder title="Drivers & Safety" />} />
        <Route path="/trips" element={<Placeholder title="Trip Dispatcher" />} />
        <Route path="/maintenance" element={<Placeholder title="Maintenance" />} />
        <Route path="/finance" element={<Placeholder title="Fuel & Expenses" />} />
        <Route path="/reports" element={<Placeholder title="Reports & Analytics" />} />
        <Route path="/settings" element={<Placeholder title="Settings & RBAC" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
