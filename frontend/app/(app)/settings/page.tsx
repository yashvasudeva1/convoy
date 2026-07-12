/* settings */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import { useForm } from 'react-hook-form';
import { Check, Minus } from 'lucide-react';

interface GeneralFormData {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

const rbacMatrix = [
  { role: 'Fleet Manager',    fleet: 'full',  drivers: 'full',  trips: '—',    fuel: '—',    analytics: 'view' },
  { role: 'Dispatcher',       fleet: 'view',  drivers: '—',     trips: 'full', fuel: '—',    analytics: '—' },
  { role: 'Safety Officer',   fleet: '—',     drivers: 'full',  trips: 'view', fuel: '—',    analytics: '—' },
  { role: 'Financial Analyst',fleet: 'view',  drivers: '—',     trips: '—',    fuel: 'full', analytics: 'full' },
];

function AccessCell({ value }: { value: string }) {
  if (value === 'full') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'var(--status-green-bg)', color: 'var(--status-green)' }}>
        <Check size={12} strokeWidth={2.5} />
      </span>
    );
  }
  if (value === 'view') {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.03em' }}>
        view
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--text-muted)' }}>
      <Minus size={12} />
    </span>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm<GeneralFormData>({
    defaultValues: {
      depotName: 'Gandhinagar Depot GJ4',
      currency: 'INR (Rs)',
      distanceUnit: 'Kilometers',
    },
  });

  const onSubmit = (data: GeneralFormData) => {
    console.log('settings saved', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Workspace preferences and role permissions" />
      <div className="page-content">
        <div className="split-panel" style={{ gridTemplateColumns: '320px 1fr', gap: 16 }}>
          {/* general settings */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">General</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16 }}>
              <div className="form-group">
                <label className="field-label">Depot Name</label>
                <input className="field-input" {...register('depotName')} />
              </div>
              <div className="form-group">
                <label className="field-label">Currency</label>
                <select className="field-input" {...register('currency')}>
                  <option>INR (Rs)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">Distance Unit</label>
                <select className="field-input" {...register('distanceUnit')}>
                  <option>Kilometers</option>
                  <option>Miles</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {saved ? 'Saved' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* rbac table */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Role-Based Access (RBAC)</span>
            </div>
            <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Drivers</th>
                  <th>Trips</th>
                  <th>Fuel / Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map(row => (
                  <tr key={row.role}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.role}</td>
                    <td><AccessCell value={row.fleet} /></td>
                    <td><AccessCell value={row.drivers} /></td>
                    <td><AccessCell value={row.trips} /></td>
                    <td><AccessCell value={row.fuel} /></td>
                    <td><AccessCell value={row.analytics} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-muted)' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={10} color="var(--status-green)" /> Full access
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>view</span> Read-only
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Minus size={10} /> No access
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
