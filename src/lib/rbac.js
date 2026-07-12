export const ROLES = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']

export const MODULES = {
  dashboard: 'Dashboard',
  fleet: 'Vehicle Registry',
  drivers: 'Drivers & Safety',
  trips: 'Trip Dispatcher',
  maintenance: 'Maintenance',
  finance: 'Fuel & Expenses',
  reports: 'Reports & Analytics',
  users: 'User Management',
  settings: 'Settings',
}

export const ROLE_ACCESS = {
  Admin: Object.keys(MODULES),
  'Fleet Manager': ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'finance', 'reports', 'settings'],
  Dispatcher: ['dashboard', 'fleet', 'trips'],
  'Safety Officer': ['dashboard', 'drivers', 'maintenance'],
  'Financial Analyst': ['dashboard', 'finance', 'reports'],
}

export const ROLE_DESCRIPTION = {
  Admin: 'Full access to every module, plus user and system management.',
  'Fleet Manager': 'Manages the fleet, drivers, trips, maintenance and reports.',
  Dispatcher: 'Creates and dispatches trips; views the fleet.',
  'Safety Officer': 'Monitors driver compliance, licenses and maintenance.',
  'Financial Analyst': 'Reviews fuel, expenses, cost and profitability reports.',
}

export const accessFor = (role) => ROLE_ACCESS[role] || ['dashboard']
