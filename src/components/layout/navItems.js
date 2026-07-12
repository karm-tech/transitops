import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, UserCog } from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: UserCog, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]
