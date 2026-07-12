/* maintenance */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import { useForm } from 'react-hook-form';
import { Wrench, Plus, CheckCircle, FileText } from 'lucide-react';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';

type MaintStatus = 'In Shop' | 'Completed';

interface MaintRecord {
  id: number;
  vehicle: string;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintStatus;
  issue: string;
  vendor: string;
}

const initial: MaintRecord[] = [
  { id: 1, vehicle: 'VAN-05',   serviceType: 'Oil Change',     cost: 2500,  date: '07 Jul 2026', status: 'In Shop', issue: 'Regular Maintenance', vendor: 'City Auto' },
  { id: 2, vehicle: 'TRUCK-11', serviceType: 'Engine Repair',  cost: 18000, date: '05 Jul 2026', status: 'Completed', issue: 'Overheating', vendor: 'Heavy Duty Hub' },
  { id: 3, vehicle: 'MINI-03',  serviceType: 'Tyre Replace',   cost: 6200,  date: '06 Jul 2026', status: 'In Shop', issue: 'Worn out tyres', vendor: 'Road Safety Tyres' },
  { id: 4, vehicle: 'VAN-09',   serviceType: 'Brake Service',  cost: 3800,  date: '03 Jul 2026', status: 'Completed', issue: 'Squeaky brakes', vendor: 'City Auto' },
];

const vehicles = ['VAN-05', 'TRUCK-11', 'TRUCK-04', 'MINI-03', 'MINI-08', 'VAN-09'];
const serviceTypes = ['Oil Change', 'Engine Repair', 'Tyre Replace', 'Brake Service', 'AC Repair', 'General Service'];

interface FormData {
  vehicle: string;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintStatus;
  issue: string;
  vendor: string;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintRecord[]>(initial);
  const { user } = useUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { vehicle: 'VAN-05', serviceType: 'Oil Change', status: 'In Shop' },
  });

  if (user?.role !== 'Fleet Manager') return <AccessDenied />;

  const onSubmit = (data: FormData) => {
    setRecords(prev => [{ ...data, id: Date.now() }, ...prev]);
    reset();
  };

  const closeRecord = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  const statusFlow = [
    { from: 'Available', arrow: 'creating active record', to: 'In Shop' },
    { from: 'In Shop',   arrow: 'closing record (not retired)', to: 'Completed' },
  ];

  return (
    <>
      <Topbar title="Maintenance" />
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
          {/* log form */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <span className="section-title">Log Service Record</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16 }}>
              <div className="form-group">
                <label className="field-label">Vehicle</label>
                <select className="field-input" {...register('vehicle')}>
                  {vehicles.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">Service Type</label>
                <select className="field-input" {...register('serviceType')}>
                  {serviceTypes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">Cost (₹)</label>
                <input className="field-input" type="number" {...register('cost', { required: 'Required' })} />
                {errors.cost && <p className="field-error">{errors.cost.message}</p>}
              </div>
              <div className="form-group">
                <label className="field-label">Date</label>
                <input className="field-input" type="date" {...register('date', { required: 'Required' })} />
                {errors.date && <p className="field-error">{errors.date.message}</p>}
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
                <Plus size={16} /> Save Record
              </button>
            </form>

            {/* status flow */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Vehicle Status Flow</div>
              {statusFlow.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11 }}>
                  <StatusBadge label={s.from} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>→ {s.arrow} →</span>
                  <StatusBadge label={s.to} />
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Rule: Opening a log sets vehicle to In Shop. Closing it sets it to Completed.
              </div>
            </div>
          </div>

          {/* service log table */}
          <div className="surface">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <span className="section-title">Service Log</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Details</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.vehicle}</td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.serviceType}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.issue}</div>
                    </td>
                    <td>₹{r.cost.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{r.date}</td>
                    <td><StatusBadge label={r.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status === 'In Shop' && (
                        <button
                          className="btn-ghost"
                          onClick={() => closeRecord(r.id)}
                          style={{ padding: '4px 10px', fontSize: 11, color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                        >
                          <CheckCircle size={11} style={{ marginRight: 4, display: 'inline' }} /> Close
                        </button>
                      )}
                      {r.status === 'Completed' && (
                        <button className="btn-secondary" style={{ padding: '4px 8px' }}>
                          <FileText size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
