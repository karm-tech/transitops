// Builds and downloads a structured CSV report — header, summary, per-vehicle table, totals.
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
const line = (cells) => cells.map(esc).join(',')

export function downloadReportCsv(data, generatedAt = '') {
  const m = data?.metrics || {}
  const rows = data?.perVehicle || []

  const totals = rows.reduce(
    (a, v) => ({
      revenue: a.revenue + (v.revenue || 0),
      fuelCost: a.fuelCost + (v.fuelCost || 0),
      maintenanceCost: a.maintenanceCost + (v.maintenanceCost || 0),
      otherCost: a.otherCost + (v.otherCost || 0),
      operationalCost: a.operationalCost + (v.operationalCost || 0),
    }),
    { revenue: 0, fuelCost: 0, maintenanceCost: 0, otherCost: 0, operationalCost: 0 },
  )

  const csv = [
    line(['TransitOps — Operations Report']),
    line(['Company', 'TransitOps Logistics Pvt. Ltd.']),
    line(['Generated', generatedAt]),
    '',
    line(['Summary Metrics']),
    line(['Fuel Efficiency (km/L)', m.fuelEfficiency ?? '']),
    line(['Fleet Utilization (%)', m.fleetUtilization ?? '']),
    line(['Operational Cost (INR)', m.operationalCost ?? '']),
    line(['Vehicle ROI (%)', m.vehicleRoi ?? '']),
    '',
    line(['Per-Vehicle Performance']),
    line(['Reg No', 'Vehicle', 'Revenue', 'Fuel', 'Maintenance', 'Other', 'Operational Cost', 'ROI %']),
    ...rows.map((v) => line([v.regNumber, v.name, v.revenue, v.fuelCost, v.maintenanceCost, v.otherCost, v.operationalCost, v.roi])),
    line(['TOTAL', '', totals.revenue, totals.fuelCost, totals.maintenanceCost, totals.otherCost, totals.operationalCost, '']),
  ].join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'transitops-report.csv'
  link.click()
  URL.revokeObjectURL(url)
}
