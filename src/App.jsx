import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import VehiclesPage from '@/features/vehicles/VehiclesPage'
import VehicleDetailPage from '@/features/vehicles/VehicleDetailPage'
import DriversPage from '@/features/drivers/DriversPage'
import DriverDetailPage from '@/features/drivers/DriverDetailPage'
import TripsPage from '@/features/trips/TripsPage'
import TripCreatePage from '@/features/trips/TripCreatePage'
import TripDetailPage from '@/features/trips/TripDetailPage'
import MaintenancePage from '@/features/maintenance/MaintenancePage'
import FinancePage from '@/features/finance/FinancePage'
import ReportsPage from '@/features/reports/ReportsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import UsersPage from '@/features/users/UsersPage'
import ProfilePage from '@/features/profile/ProfilePage'

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
        <Route path="/fleet/:id" element={<VehicleDetailPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/drivers/:id" element={<DriverDetailPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/new" element={<TripCreatePage />} />
        <Route path="/trips/:id" element={<TripDetailPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
