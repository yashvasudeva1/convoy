/* analytics */
'use client';

import { useQuery } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, Fuel as FuelIcon, Gauge, DollarSign, TrendingUp } from 'lucide-react';
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
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
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
    { label: 'Fuel Efficiency', value: `${analytics.fuelEfficiency.fleetKmPerLiter.toFixed(1)} km/l`, sub: 'average across fleet', icon: FuelIcon },
    { label: 'Fleet Utilization', value: `${analytics.fleetUtilization.toFixed(0)}%`, sub: 'active vs total', icon: Gauge },
    { label: 'Operational Cost', value: `₹${analytics.operationalCost.totalOperationalCost.toLocaleString('en-IN')}`, sub: 'fuel + expenses', icon: DollarSign },
    {
      label: 'Cost Efficiency',
      value: `${analytics.vehicleROI.reduce((s, v) => s + v.completedTrips, 0)} trips`,
      sub: 'completed, fleet-wide',
      icon: TrendingUp,
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

  const utilization = analytics ? Math.max(0, Math.min(100, analytics.fleetUtilization)) : 0;
  const gaugeData = [
    { name: 'Utilized', value: utilization, color: 'var(--accent)' },
    { name: 'Idle', value: 100 - utilization, color: 'var(--border)' },
  ];

  const fuelCost = analytics?.operationalCost.fuelCost ?? 0;
  const expenseCost = analytics?.operationalCost.expenseCost ?? 0;
  const costTotal = fuelCost + expenseCost;
  const fuelPct = costTotal > 0 ? Math.round((fuelCost / costTotal) * 100) : 0;

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
      <Topbar title="Analytics" subtitle="Fleet efficiency, cost and utilization reports" />
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
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {isLoading && <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Loading KPIs...</div>}
          {!isLoading && kpis.map(k => (
            <div className="kpi-item" key={k.label}>
              <div className="kpi-item-head">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-icon"><k.icon size={17} strokeWidth={2} /></div>
              </div>
              <div className="kpi-value" style={{ fontSize: 24 }}>{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* cost efficiency formula */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '11px 16px',
          fontSize: 11.5,
          color: 'var(--text-secondary)',
          marginBottom: 20,
          fontFamily: 'ui-monospace, monospace',
        }}>
          Cost Efficiency = Completed Trips / Operational Cost (fuel + expenses) — no revenue/acquisition-cost tracking yet
        </div>

        {/* utilization gauge + cost breakdown */}
        <div className="split-panel" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Fleet Utilization</span>
            </div>
            <div style={{ padding: '18px 18px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gaugeData} dataKey="value" innerRadius={42} outerRadius={58} startAngle={90} endAngle={-270} stroke="none">
                      {gaugeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{utilization.toFixed(0)}%</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Share of the active fleet currently dispatched on a trip, right now.
                </div>
              </div>
            </div>
          </div>

          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Operational Cost Breakdown</span>
            </div>
            <div style={{ padding: '18px' }}>
              <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', background: 'var(--bg-surface-2)', marginBottom: 14 }}>
                <div style={{ width: `${fuelPct}%`, background: 'var(--chart-1)' }} />
                <div style={{ width: `${100 - fuelPct}%`, background: 'var(--chart-3)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--chart-1)', display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Fuel</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>₹{fuelCost.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Expenses</span>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--chart-3)', display: 'inline-block' }} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>₹{expenseCost.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="split-panel-right" style={{ gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
          {/* trips vs cost per vehicle */}
          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Completed Trips by Vehicle</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roiData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="vehicle" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="trips" name="Trips" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* costliest vehicles */}
          <div className="surface" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
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
                    padding: '10px 18px',
                    borderBottom: i < costliest.length - 1 ? '1px solid var(--border-muted)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', width: 16 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{v.vehicle}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-red)' }}>₹{v.cost.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {costliest.length === 0 && (
                <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No cost data yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* fuel efficiency */}
        <div className="surface">
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
            <span className="section-title">Fuel Efficiency by Vehicle (km/l)</span>
          </div>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={Math.max(180, fuelEffData.length * 34)}>
              <BarChart data={fuelEffData} layout="vertical" margin={{ left: 20, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} unit=" km/l" />
                <YAxis type="category" dataKey="vehicle" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="kmpl" name="kmpl" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
