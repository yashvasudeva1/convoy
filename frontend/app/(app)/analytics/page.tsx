/* analytics */
'use client';

import Topbar from '@/components/layout/topbar';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';

const kpis = [
  { label: 'Fuel Efficiency', value: '8.4 km/l',  sub: 'average across fleet' },
  { label: 'Fleet Utilization', value: '81%',      sub: 'active vs total' },
  { label: 'Operational Cost', value: '₹34,070',   sub: 'fuel + maintenance' },
  { label: 'Vehicle ROI',      value: '14.2%',     sub: 'net return on fleet' },
];

const monthlyRevenue = [
  { month: 'Feb', revenue: 82000, cost: 26000 },
  { month: 'Mar', revenue: 95000, cost: 29000 },
  { month: 'Apr', revenue: 88000, cost: 31000 },
  { month: 'May', revenue: 104000, cost: 34000 },
  { month: 'Jun', revenue: 112000, cost: 32000 },
  { month: 'Jul', revenue: 98000,  cost: 34070 },
];

const fuelEffData = [
  { vehicle: 'VAN-05',   kmpl: 9.2 },
  { vehicle: 'MINI-08',  kmpl: 11.4 },
  { vehicle: 'TRUCK-04', kmpl: 6.1 },
  { vehicle: 'TRUCK-11', kmpl: 5.8 },
  { vehicle: 'VAN-09',   kmpl: 8.7 },
];

const costliest = [
  { vehicle: 'TRUCK-11', cost: 18000 },
  { vehicle: 'MINI-03',  cost: 6200 },
  { vehicle: 'VAN-05',   cost: 2500 },
];

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
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'kmpl' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useUser();
  if (user.role === 'Dispatcher' || user.role === 'Safety Officer') return <AccessDenied />;

  return (
    <>
      <Topbar title="Analytics" />
      <div className="page-content">
        {/* export */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn-secondary" style={{ fontSize: 12 }}>Export CSV</button>
        </div>

        {/* kpis */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {kpis.map(k => (
            <div className="kpi-item" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* roi formula */}
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
          ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
          {/* monthly revenue vs cost */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Monthly Revenue vs Cost</span>
            </div>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyRevenue} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="var(--accent-green)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="cost"    name="Cost"    fill="var(--accent-amber)" radius={[2, 2, 0, 0]} />
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
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 14]} unit=" km/l" />
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
