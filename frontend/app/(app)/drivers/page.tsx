/* drivers */
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import Modal from '@/components/modal';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { api, ApiError } from '@/lib/api';
import { DRIVER_STATUS_TO_LABEL, LABEL_TO_DRIVER_STATUS } from '@/lib/mappings';
import { ApiDriver } from '@/lib/types';

interface FormData {
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  status: string;
}

export default function DriversPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiDriver | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const { data: drivers = [], isLoading, isError } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<ApiDriver[]>('/drivers'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['drivers'] });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; licenseNumber: string; licenseExpiry: string; safetyScore: number; status: ApiDriver['status'] }) =>
      api.post<ApiDriver>('/drivers', payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; licenseNumber: string; licenseExpiry: string; safetyScore: number; status: ApiDriver['status'] }> }) =>
      api.put<ApiDriver>(`/drivers/${id}`, payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
    },
  });

  if (user.role === 'Dispatcher' || user.role === 'Financial Analyst') return <AccessDenied />;

  const canCreateDelete = user.role === 'Fleet Manager';
  const canEdit = user.role === 'Fleet Manager' || user.role === 'Safety Officer';

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    reset({ name: '', licenseNumber: '', licenseExpiry: '', safetyScore: 100, status: 'Available' });
    setModalOpen(true);
  };

  const openEdit = (d: ApiDriver) => {
    setEditing(d);
    setFormError('');
    reset({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry.slice(0, 10),
      safetyScore: d.safetyScore,
      status: DRIVER_STATUS_TO_LABEL[d.status],
    });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    setFormError('');
    const payload = {
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      safetyScore: Number(data.safetyScore),
      status: LABEL_TO_DRIVER_STATUS[data.status],
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <>
      <Topbar title="Drivers" />
      <div className="page-content">
        {/* header */}
        <div className="section-header">
          <input
            className="field-input"
            style={{ width: 240, fontSize: 12 }}
            placeholder="Search driver or license no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {canCreateDelete && (
            <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Driver
            </button>
          )}
        </div>

        {/* rule note */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Rule: Expired license or Suspended status — blocked from trip assignment
        </div>

        {/* table */}
        <div className="surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>License No.</th>
                <th>Expiry</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading drivers...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--accent-red)', padding: 32 }}>Could not load drivers.</td></tr>
              )}
              {!isLoading && !isError && filtered.map(d => {
                const safetyNum = d.safetyScore;
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.licenseNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: d.isLicenseExpired ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          {new Date(d.licenseExpiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                        {d.isLicenseExpired && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent-red)', fontWeight: 700 }}>
                            <AlertTriangle size={10} /> EXPIRED
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 4, background: 'var(--border-muted)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${safetyNum}%`,
                            background: safetyNum >= 90 ? 'var(--accent-green)' : safetyNum >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{safetyNum}</span>
                      </div>
                    </td>
                    <td><StatusBadge label={DRIVER_STATUS_TO_LABEL[d.status]} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {canEdit && (
                          <button className="btn-ghost" onClick={() => openEdit(d)} style={{ padding: '4px 8px' }}>
                            <Pencil size={12} />
                          </button>
                        )}
                        {canCreateDelete && (
                          <button className="btn-danger" onClick={() => setDeleteId(d.id)} style={{ padding: '4px 8px' }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No drivers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* status toggle legend */}
        <div style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Status Legend</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Available', 'On Trip', 'Off Duty', 'Suspended'].map(s => (
              <StatusBadge key={s} label={s} />
            ))}
          </div>
        </div>
      </div>

      {/* add/edit modal */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Driver' : 'Add Driver'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" form="driver-form" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Add Driver'}
            </button>
          </>
        }
      >
        <form id="driver-form" onSubmit={handleSubmit(onSubmit)}>
          {formError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{formError}</span></div>}
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="Driver name" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="field-label">License No.</label>
            <input className="field-input" placeholder="DL-XXXXX" {...register('licenseNumber', { required: 'Required' })} />
            {errors.licenseNumber && <p className="field-error">{errors.licenseNumber.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">License Expiry</label>
              <input className="field-input" type="date" {...register('licenseExpiry', { required: 'Required' })} />
              {errors.licenseExpiry && <p className="field-error">{errors.licenseExpiry.message}</p>}
            </div>
            <div className="form-group">
              <label className="field-label">Safety Score (0-100)</label>
              <input className="field-input" type="number" placeholder="85" {...register('safetyScore', { required: 'Required', min: 0, max: 100 })} />
            </div>
          </div>
          <div className="form-group">
            <label className="field-label">Status</label>
            <select className="field-input" {...register('status')}>
              <option>Available</option>
              <option>Off Duty</option>
              <option>Suspended</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* delete confirm */}
      <Modal
        open={deleteId !== null}
        title="Remove Driver"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete}>Remove</button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Remove this driver from the registry? All associated records will remain.
        </p>
      </Modal>
    </>
  );
}
