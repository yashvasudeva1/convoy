/* maintenance */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle } from 'lucide-react';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { api, ApiError } from '@/lib/api';
import { MAINTENANCE_STATUS_TO_LABEL } from '@/lib/mappings';
import { ApiMaintenanceLog, ApiVehicle } from '@/lib/types';
import { useState } from 'react';

const serviceTypes = ['Oil Change', 'Engine Repair', 'Tyre Replace', 'Brake Service', 'AC Repair', 'General Service'];

interface FormData {
  vehicleId: string;
  reason: string;
  notes?: string;
}

export default function MaintenancePage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { reason: 'Oil Change' },
  });

  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => api.get<ApiMaintenanceLog[]>('/maintenance'),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<ApiVehicle[]>('/vehicles'),
  });

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => api.post<ApiMaintenanceLog>('/maintenance', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      reset({ reason: 'Oil Change' });
      setFormError('');
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.patch<ApiMaintenanceLog>(`/maintenance/${id}/close`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  if (user?.role !== 'Fleet Manager' && user?.role !== 'Safety Officer') return <AccessDenied />;

  const onSubmit = (data: FormData) => {
    setFormError('');
    createMutation.mutate(data);
  };

  const statusFlow = [
    { from: 'Available', arrow: 'creating active record', to: 'In Shop' },
    { from: 'In Shop', arrow: 'closing record', to: 'Available' },
  ];

  return (
    <>
      <Topbar title="Maintenance" subtitle="Service records and vehicle shop status" />
      <div className="page-content">
        <div className="split-panel" style={{ gridTemplateColumns: '300px 1fr', gap: 16 }}>
          {/* log form */}
          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Log Service Record</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16 }}>
              {formError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{formError}</span></div>}
              <div className="form-group">
                <label className="field-label">Vehicle (Available only)</label>
                <select className="field-input" {...register('vehicleId', { required: 'Required' })}>
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="field-error">{errors.vehicleId.message}</p>}
              </div>
              <div className="form-group">
                <label className="field-label">Service Type</label>
                <select className="field-input" {...register('reason')}>
                  {serviceTypes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">Notes (optional)</label>
                <input className="field-input" placeholder="e.g. Worn out tyres, City Auto" {...register('notes')} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={createMutation.isPending}>
                <Plus size={16} /> Open Record
              </button>
            </form>

            {/* status flow */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-muted)' }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Vehicle Status Flow</div>
              {statusFlow.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11 }}>
                  <StatusBadge label={s.from} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>→ {s.arrow} →</span>
                  <StatusBadge label={s.to} />
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Rule: Opening a record sets vehicle to In Shop. Closing it sets vehicle back to Available.
              </div>
            </div>
          </div>

          {/* service log table */}
          <div className="surface">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Service Log</span>
            </div>
            <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Details</th>
                  <th>Opened</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading records...</td></tr>
                )}
                {isError && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--accent-red)', padding: 32 }}>Could not load maintenance records.</td></tr>
                )}
                {!isLoading && !isError && records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.vehicle?.registrationNumber ?? '—'}</td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.reason}</div>
                      {r.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.notes}</div>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                      {new Date(r.openedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td><StatusBadge label={MAINTENANCE_STATUS_TO_LABEL[r.status]} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status === 'OPEN' && (
                        <button
                          className="btn-ghost"
                          onClick={() => closeMutation.mutate(r.id)}
                          disabled={closeMutation.isPending}
                          style={{ padding: '4px 10px', fontSize: 11, color: 'var(--status-green)', borderColor: 'var(--status-green-bg)' }}
                        >
                          <CheckCircle size={11} style={{ marginRight: 4, display: 'inline' }} /> Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!isLoading && !isError && records.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No maintenance records yet.</td></tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
