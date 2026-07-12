import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings, UserCog, Mail } from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Analytics', icon: BarChart3 },
  { to: '/mails', label: 'Sent Mails', icon: Mail, roles: ['Admin', 'Fleet Manager'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['Admin'] },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const visibleNav = (role) => navItems.filter((item) => !item.roles || item.roles.includes(role))
