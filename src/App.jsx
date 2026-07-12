import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import Placeholder from '@/components/common/Placeholder'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import VehiclesPage from '@/features/vehicles/VehiclesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fleet" element={<VehiclesPage />} />
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
