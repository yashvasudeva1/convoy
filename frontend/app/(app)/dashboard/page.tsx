/* dashboard */
'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import {
  Truck, CheckCircle2, Wrench, Navigation as NavigationIcon,
  Route, Clock, UserCheck, Gauge,
} from 'lucide-react';
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
  const recentTrips = [...trips].slice(0, 6);

  const utilizationPct = dashboard && dashboard.activeVehicles > 0
    ? Math.round((dashboard.onTripVehicles / dashboard.activeVehicles) * 100)
    : 0;

  const kpis = dashboard ? [
    { label: 'Total Vehicles', value: String(dashboard.activeVehicles), sub: 'total fleet', icon: Truck, tone: 'accent' as const },
    { label: 'Available', value: String(dashboard.availableVehicles), sub: 'ready to dispatch', icon: CheckCircle2, tone: 'green' as const },
    { label: 'On Trip', value: String(dashboard.onTripVehicles), sub: 'on the road', icon: NavigationIcon, tone: 'blue' as const },
    { label: 'In Maintenance', value: String(dashboard.vehiclesInMaintenance), sub: 'in shop', icon: Wrench, tone: 'amber' as const },
    { label: 'Active Trips', value: String(dashboard.activeTrips), sub: 'dispatched', icon: Route, tone: 'accent' as const },
    { label: 'Pending Trips', value: String(dashboard.pendingTrips), sub: 'awaiting dispatch', icon: Clock, tone: 'accent' as const },
    { label: 'Drivers on Duty', value: String(dashboard.driversOnDuty), sub: 'currently active', icon: UserCheck, tone: 'accent' as const },
    { label: 'Fleet Utilization', value: `${utilizationPct}%`, sub: 'on trip vs total', icon: Gauge, tone: 'accent' as const },
  ] : [];

  const toneColor: Record<string, string> = {
    accent: 'var(--accent)',
    green: 'var(--status-green)',
    blue: 'var(--status-blue)',
    amber: 'var(--status-amber)',
  };
  const toneBg: Record<string, string> = {
    accent: 'var(--accent-soft)',
    green: 'var(--status-green-bg)',
    blue: 'var(--status-blue-bg)',
    amber: 'var(--status-amber-bg)',
  };

  const retiredCount = dashboard
    ? Math.max(0, dashboard.activeVehicles - dashboard.availableVehicles - dashboard.vehiclesInMaintenance - dashboard.onTripVehicles)
    : 0;

  const vehicleStatus = dashboard ? [
    { label: 'Available', count: dashboard.availableVehicles, color: 'var(--status-green)' },
    { label: 'On Trip', count: dashboard.onTripVehicles, color: 'var(--status-amber)' },
    { label: 'In Shop', count: dashboard.vehiclesInMaintenance, color: 'var(--status-blue)' },
    { label: 'Retired', count: retiredCount, color: 'var(--status-red)' },
  ] : [];

  const donutData = vehicleStatus.filter(v => v.count > 0);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Live overview of fleet, trips and drivers" />
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
              <div className="kpi-item-head">
                <div>
                  <div className="kpi-label">{k.label}</div>
                </div>
                <div className="kpi-icon" style={{ background: toneBg[k.tone], color: toneColor[k.tone] }}>
                  <k.icon size={17} strokeWidth={2} />
                </div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="split-panel-right" style={{ gridTemplateColumns: '1fr 280px', gap: 16 }}>
          {/* recent trips */}
          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Recent Trips</span>
            </div>
            <div className="table-scroll">
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
                {recentTrips.map(t => {
                  const driver = driverById.get(t.driverId);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{t.id.slice(0, 8)}</td>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{vehicleById.get(t.vehicleId)?.registrationNumber ?? '—'}</td>
                      <td>
                        <div className="row-identity">
                          <div className="avatar avatar-sm">{driver?.name ? driver.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '—'}</div>
                          <span className="row-identity-name">{driver?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td><StatusBadge label={TRIP_STATUS_TO_LABEL[t.status]} /></td>
                    </tr>
                  );
                })}
                {recentTrips.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No trips yet.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          </div>

          {/* vehicle status panel */}
          <div className="surface" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Fleet Status</span>
            </div>
            <div style={{ padding: '16px 0 4px', position: 'relative' }}>
              <div style={{ position: 'relative', height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData.length ? donutData : [{ label: 'None', count: 1, color: 'var(--border)' }]}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={donutData.length > 1 ? 3 : 0}
                      stroke="none"
                    >
                      {(donutData.length ? donutData : [{ label: 'None', count: 1, color: 'var(--border)' }]).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {dashboard?.activeVehicles ?? 0}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    vehicles
                  </div>
                </div>
              </div>

              {vehicleStatus.map(vs => (
                <div
                  key={vs.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 18px',
                    borderTop: '1px solid var(--border-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: vs.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{vs.label}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{vs.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
