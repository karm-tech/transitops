export const VEHICLE_STATUS = ['Available', 'OnTrip', 'InShop', 'Retired']
export const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Bus', 'Tempo']
export const DRIVER_STATUS = ['Available', 'OnTrip', 'OffDuty', 'Suspended']
export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled']

export const STATUS_LABEL = { OnTrip: 'On Trip', InShop: 'In Shop', OffDuty: 'Off Duty' }
export const labelFor = (s) => STATUS_LABEL[s] || s
