/* analytics */
'use client';

import { useQuery } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { api } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { ApiAnalytics, ApiVehicle } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 12,
      color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name === 'Cost' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useUser();

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get<ApiAnalytics>('/analytics'),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<ApiVehicle[]>('/vehicles'),
  });

  if (user.role === 'Dispatcher' || user.role === 'Safety Officer') return <AccessDenied />;

  const vehicleLabel = (id: string) => vehicles.find(v => v.id === id)?.registrationNumber ?? id.slice(0, 8);

  const kpis = analytics ? [
    { label: 'Fuel Efficiency', value: `${analytics.fuelEfficiency.fleetKmPerLiter.toFixed(1)} km/l`, sub: 'average across fleet' },
    { label: 'Fleet Utilization', value: `${analytics.fleetUtilization.toFixed(0)}%`, sub: 'active vs total' },
    { label: 'Operational Cost', value: `₹${analytics.operationalCost.totalOperationalCost.toLocaleString('en-IN')}`, sub: 'fuel + expenses' },
    {
      label: 'Cost Efficiency',
      value: `${analytics.vehicleROI.reduce((s, v) => s + v.completedTrips, 0)} trips`,
      sub: 'completed, fleet-wide',
    },
  ] : [];

  const fuelEffData = analytics
    ? analytics.fuelEfficiency.perVehicle.map(v => ({ vehicle: vehicleLabel(v.vehicleId), kmpl: Number(v.kmPerLiter.toFixed(1)) }))
    : [];

  const costliest = analytics
    ? [...analytics.vehicleROI]
      .filter(v => v.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map(v => ({ vehicle: vehicleLabel(v.vehicleId), cost: v.cost }))
    : [];

  const roiData = analytics
    ? analytics.vehicleROI.map(v => ({ vehicle: vehicleLabel(v.vehicleId), trips: v.completedTrips, cost: v.cost }))
    : [];

  const exportCsv = () => {
    if (!analytics) return;
    const fuelByVehicle = new Map(analytics.fuelEfficiency.perVehicle.map(v => [v.vehicleId, v]));
    const rows = analytics.vehicleROI.map(v => {
      const fuel = fuelByVehicle.get(v.vehicleId);
      return [
        vehicleLabel(v.vehicleId),
        v.completedTrips,
        v.cost.toFixed(2),
        v.tripsPerCostUnit.toFixed(4),
        fuel ? fuel.kmPerLiter.toFixed(2) : '',
        fuel ? fuel.distance : '',
        fuel ? fuel.totalLiters : '',
      ];
    });
    downloadCsv(
      `transitops-analytics-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Vehicle', 'Completed Trips', 'Cost (INR)', 'Cost Efficiency (trips/INR)', 'Fuel Efficiency (km/l)', 'Distance (km)', 'Fuel Used (L)'],
      rows
    );
  };

  return (
    <>
      <Topbar title="Analytics" />
      <div className="page-content">
        {isError && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>Could not load analytics data.</span>
          </div>
        )}

        <div className="section-header">
          <span className="section-title">Fleet Reports</span>
          <button className="btn-secondary" onClick={exportCsv} disabled={!analytics} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* kpis */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {isLoading && <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Loading KPIs...</div>}
          {!isLoading && kpis.map(k => (
            <div className="kpi-item" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* cost efficiency formula */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '10px 16px',
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 24,
          fontFamily: 'monospace',
        }}>
          Cost Efficiency = Completed Trips / Operational Cost (fuel + expenses) — no revenue/acquisition-cost tracking yet
        </div>

        <div className="split-panel-right" style={{ gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
          {/* trips vs cost per vehicle */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Completed Trips vs Cost by Vehicle</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roiData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                  <XAxis dataKey="vehicle" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="trips" name="Trips" fill="var(--accent-green)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* costliest vehicles */}
          <div className="surface" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Top Costliest Vehicles</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {costliest.map((v, i) => (
                <div
                  key={v.vehicle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: i < costliest.length - 1 ? '1px solid var(--border-muted)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 16 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v.vehicle}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-red)' }}>₹{v.cost.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {costliest.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No cost data yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* fuel efficiency */}
        <div className="surface">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
            <span className="section-title">Fuel Efficiency by Vehicle (km/l)</span>
          </div>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fuelEffData} layout="vertical" margin={{ left: 20, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} unit=" km/l" />
                <YAxis type="category" dataKey="vehicle" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="kmpl" name="kmpl" fill="var(--accent-blue)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
