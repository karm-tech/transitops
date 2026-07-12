export const ROLES = {
  ADMIN: 'Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

export const ROLE_VALUES = Object.values(ROLES)

export const VEHICLE_STATUS = ['Available', 'OnTrip', 'InShop', 'Retired']
export const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Bus', 'Tempo']
export const DRIVER_STATUS = ['Available', 'OnTrip', 'OffDuty', 'Suspended']
export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled']
export const MAINTENANCE_STATUS = ['Active', 'Closed']
export const EXPENSE_CATEGORIES = ['Toll', 'Fuel', 'Maintenance', 'Other']
export const DOCUMENT_TYPES = ['RC', 'Insurance', 'Permit', 'Other']

// Default permission matrix surfaced on the Settings screen.
// Admin implicitly has every permission (see requireRole middleware).
export const DEFAULT_RBAC = {
  Admin: ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'finance', 'reports', 'settings'],
  'Fleet Manager': ['fleet', 'drivers', 'trips', 'maintenance', 'finance', 'reports', 'settings'],
  Dispatcher: ['dashboard', 'trips', 'fleet'],
  'Safety Officer': ['drivers', 'maintenance'],
  'Financial Analyst': ['finance', 'reports'],
}
