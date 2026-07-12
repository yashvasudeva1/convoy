/* dashboard */
'use client';

import { useQuery } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import { api } from '@/lib/api';
import { TRIP_STATUS_TO_LABEL } from '@/lib/mappings';
import { ApiDashboard, ApiDriver, ApiTrip, ApiVehicle } from '@/lib/types';

export default function DashboardPage() {
  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<ApiDashboard>('/dashboard'),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get<ApiTrip[]>('/trips'),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<ApiVehicle[]>('/vehicles'),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<ApiDriver[]>('/drivers'),
  });

  const vehicleById = new Map(vehicles.map(v => [v.id, v]));
  const driverById = new Map(drivers.map(d => [d.id, d]));
  const recentTrips = [...trips].slice(0, 5);

  const kpis = dashboard ? [
    { label: 'Total Vehicles', value: String(dashboard.activeVehicles), sub: 'total fleet' },
    { label: 'Available Vehicles', value: String(dashboard.availableVehicles), sub: 'ready to dispatch' },
    { label: 'In Maintenance', value: String(dashboard.vehiclesInMaintenance), sub: 'in shop' },
    { label: 'Vehicles On Trip', value: String(dashboard.onTripVehicles), sub: 'on the road' },
    { label: 'Active Trips', value: String(dashboard.activeTrips), sub: 'dispatched' },
    { label: 'Pending Trips', value: String(dashboard.pendingTrips), sub: 'awaiting dispatch' },
    { label: 'Drivers on Duty', value: String(dashboard.driversOnDuty), sub: 'currently active' },
  ] : [];

  const retiredCount = dashboard
    ? Math.max(0, dashboard.activeVehicles - dashboard.availableVehicles - dashboard.vehiclesInMaintenance - dashboard.onTripVehicles)
    : 0;

  const vehicleStatus = dashboard ? [
    { label: 'Available', count: dashboard.availableVehicles, color: 'var(--accent-green)' },
    { label: 'On Trip', count: dashboard.onTripVehicles, color: 'var(--accent-amber)' },
    { label: 'In Shop', count: dashboard.vehiclesInMaintenance, color: 'var(--accent-blue)' },
    { label: 'Retired', count: retiredCount, color: 'var(--accent-red)' },
  ] : [];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">
        {isError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>Could not load dashboard data.</span>
          </div>
        )}

        {/* kpi grid */}
        <div className="kpi-grid">
          {isLoading && <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Loading KPIs...</div>}
          {!isLoading && kpis.map(k => (
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
                </tr>
              </thead>
              <tbody>
                {recentTrips.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{t.id.slice(0, 8)}</td>
                    <td>{vehicleById.get(t.vehicleId)?.registrationNumber ?? '—'}</td>
                    <td>{driverById.get(t.driverId)?.name ?? '—'}</td>
                    <td><StatusBadge label={TRIP_STATUS_TO_LABEL[t.status]} /></td>
                  </tr>
                ))}
                {recentTrips.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No trips yet.</td></tr>
                )}
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
