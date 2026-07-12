import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const BRAND = '#d97a2b'
const DARK = '#111827'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'

const s = StyleSheet.create({
  page: { paddingBottom: 64, fontSize: 10, color: DARK, fontFamily: 'Helvetica' },

  header: { backgroundColor: BRAND, paddingHorizontal: 32, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#ffffff', color: BRAND, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: BRAND },
  brandName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  brandTag: { fontSize: 8, color: '#fdead4' },
  headerRight: { alignItems: 'flex-end' },
  reportTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  reportDate: { fontSize: 8, color: '#fdead4', marginTop: 2 },

  watermark: { position: 'absolute', top: 320, left: 60, fontSize: 90, color: BRAND, opacity: 0.06, fontFamily: 'Helvetica-Bold', transform: 'rotate(-30deg)' },

  body: { paddingHorizontal: 32, paddingTop: 22 },
  metrics: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  metric: { flex: 1, borderRadius: 6, border: `1 solid ${BORDER}`, padding: 10 },
  metricTop: { height: 3, borderRadius: 2, marginBottom: 6 },
  metricLabel: { fontSize: 7, color: MUTED, letterSpacing: 0.5 },
  metricValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 3 },

  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  thead: { flexDirection: 'row', backgroundColor: '#fdf6ec', paddingVertical: 6, paddingHorizontal: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  th: { fontSize: 8, color: BRAND, fontFamily: 'Helvetica-Bold', letterSpacing: 0.3 },
  row: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottom: `1 solid ${BORDER}` },
  rowAlt: { backgroundColor: '#fafafa' },
  c: { flex: 1, fontSize: 9 },
  cWide: { flex: 2, fontSize: 9 },
  bold: { fontFamily: 'Helvetica-Bold' },
  pos: { color: '#059669', fontFamily: 'Helvetica-Bold' },
  neg: { color: '#e11d48', fontFamily: 'Helvetica-Bold' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1 solid ${BORDER}`, paddingHorizontal: 32, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footText: { fontSize: 7, color: MUTED },
})

const money = (n) => `Rs ${Number(n || 0).toLocaleString('en-IN')}`

export default function ReportPDF({ data, generatedAt = '' }) {
  const m = data?.metrics || {}
  const rows = data?.perVehicle || []
  const metricCards = [
    { label: 'FUEL EFFICIENCY', value: `${m.fuelEfficiency} km/L`, color: '#3b82f6' },
    { label: 'FLEET UTILIZATION', value: `${m.fleetUtilization}%`, color: '#10b981' },
    { label: 'OPERATIONAL COST', value: money(m.operationalCost), color: '#f59e0b' },
    { label: 'VEHICLE ROI', value: `${m.vehicleRoi}%`, color: BRAND },
  ]

  return (
    <Document title="TransitOps Operations Report" author="TransitOps">
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <View style={s.brandRow}>
            <View style={s.logo}><Text style={s.logoText}>T</Text></View>
            <View>
              <Text style={s.brandName}>TransitOps</Text>
              <Text style={s.brandTag}>Smart Transport Operations Platform</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.reportTitle}>Operations Report</Text>
            <Text style={s.reportDate}>Generated {generatedAt}</Text>
          </View>
        </View>

        <Text style={s.watermark} fixed>TransitOps</Text>

        <View style={s.body}>
          <View style={s.metrics}>
            {metricCards.map((c) => (
              <View style={s.metric} key={c.label}>
                <View style={[s.metricTop, { backgroundColor: c.color }]} />
                <Text style={s.metricLabel}>{c.label}</Text>
                <Text style={s.metricValue}>{c.value}</Text>
              </View>
            ))}
          </View>

          <Text style={s.sectionTitle}>Per-Vehicle Performance</Text>
          <View style={s.thead}>
            <Text style={[s.c, s.th]}>Reg No</Text>
            <Text style={[s.cWide, s.th]}>Vehicle</Text>
            <Text style={[s.c, s.th]}>Revenue</Text>
            <Text style={[s.c, s.th]}>Fuel</Text>
            <Text style={[s.c, s.th]}>Maint.</Text>
            <Text style={[s.c, s.th]}>Op. Cost</Text>
            <Text style={[s.c, s.th]}>ROI %</Text>
          </View>
          {rows.map((v, i) => (
            <View style={[s.row, i % 2 === 1 && s.rowAlt]} key={v.id} wrap={false}>
              <Text style={[s.c, s.bold]}>{v.regNumber}</Text>
              <Text style={s.cWide}>{v.name}</Text>
              <Text style={s.c}>{money(v.revenue)}</Text>
              <Text style={s.c}>{money(v.fuelCost)}</Text>
              <Text style={s.c}>{money(v.maintenanceCost)}</Text>
              <Text style={s.c}>{money(v.operationalCost)}</Text>
              <Text style={[s.c, v.roi >= 0 ? s.pos : s.neg]}>{v.roi}%</Text>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footText}>TransitOps Logistics Pvt. Ltd.  ·  Gandhinagar, Gujarat, India  ·  ops@transitops.app  ·  +91 79 4000 1234</Text>
          <Text style={s.footText} render={({ pageNumber, totalPages }) => `Confidential · Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
