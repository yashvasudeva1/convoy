/* dashboard */
'use client';

import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';

const kpis = [
  { label: 'Active Vehicles',       value: '53',  sub: 'total fleet' },
  { label: 'Available Vehicles',    value: '42',  sub: 'ready to dispatch' },
  { label: 'In Maintenance',        value: '05',  sub: 'in shop' },
  { label: 'Active Trips',          value: '18',  sub: 'on the road' },
  { label: 'Pending Trips',         value: '09',  sub: 'awaiting dispatch' },
  { label: 'Drivers on Duty',       value: '26',  sub: 'currently active' },
  { label: 'Fleet Utilization',     value: '81%', sub: 'of total fleet' },
];

const recentTrips = [
  { id: 'TR001', vehicle: 'VAN-05',  driver: 'Alex',  status: 'On Trip',    eta: '45 min' },
  { id: 'TR002', vehicle: 'TRK-12',  driver: 'John',  status: 'Completed',  eta: '—' },
  { id: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', eta: '1h 10m' },
  { id: 'TR006', vehicle: '—',       driver: '—',     status: 'Draft',      eta: 'Awaiting vehicle' },
];

const vehicleStatus = [
  { label: 'Available', count: 42, color: 'var(--accent-green)' },
  { label: 'On Trip',   count: 18, color: 'var(--accent-amber)' },
  { label: 'In Shop',   count: 5,  color: 'var(--accent-blue)' },
  { label: 'Retired',   count: 3,  color: 'var(--accent-red)' },
];

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">
        {/* filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>
            Filters
          </span>
          {['Vehicle Type: All', 'Status: All', 'Region: All'].map(f => (
            <select
              key={f}
              className="field-input"
              style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: 12 }}
              defaultValue=""
            >
              <option value="">{f}</option>
            </select>
          ))}
        </div>

        {/* kpi grid */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <div className="kpi-item" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>
          {/* recent trips */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Recent Trips</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{t.id}</td>
                    <td>{t.vehicle}</td>
                    <td>{t.driver}</td>
                    <td><StatusBadge label={t.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* vehicle status panel */}
          <div className="surface" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Vehicle Status</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {vehicleStatus.map(vs => (
                <div
                  key={vs.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: vs.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{vs.label}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{vs.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
