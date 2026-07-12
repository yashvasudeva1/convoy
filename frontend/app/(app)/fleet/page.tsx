/* fleet */
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import Modal from '@/components/modal';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { api, ApiError } from '@/lib/api';
import { LABEL_TO_VEHICLE_STATUS, VEHICLE_STATUS_TO_LABEL } from '@/lib/mappings';
import { ApiVehicle } from '@/lib/types';

interface FormData {
  registrationNumber: string;
  make: string;
  model: string;
  capacityKg: number;
  status: string;
}

export default function FleetPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiVehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const { data: vehicles = [], isLoading, isError } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<ApiVehicle[]>('/vehicles'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });

  const createMutation = useMutation({
    mutationFn: (payload: { registrationNumber: string; make: string; model: string; capacityKg: number; status: ApiVehicle['status'] }) =>
      api.post<ApiVehicle>('/vehicles', payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ registrationNumber: string; make: string; model: string; capacityKg: number; status: ApiVehicle['status'] }> }) =>
      api.put<ApiVehicle>(`/vehicles/${id}`, payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
    },
  });

  if (user.role === 'Safety Officer') return <AccessDenied />;

  const canEdit = user.role === 'Fleet Manager';

  const filtered = vehicles.filter(v => {
    const statusLabel = VEHICLE_STATUS_TO_LABEL[v.status];
    if (statusFilter !== 'All' && statusLabel !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.registrationNumber.toLowerCase().includes(q) && !v.make.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setFormError('');
    reset({ registrationNumber: '', make: '', model: '', capacityKg: 0, status: 'Available' });
    setModalOpen(true);
  };

  const openEdit = (v: ApiVehicle) => {
    setEditing(v);
    setFormError('');
    reset({
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      capacityKg: v.capacityKg,
      status: VEHICLE_STATUS_TO_LABEL[v.status],
    });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    setFormError('');
    const payload = {
      registrationNumber: data.registrationNumber,
      make: data.make,
      model: data.model,
      capacityKg: Number(data.capacityKg),
      status: LABEL_TO_VEHICLE_STATUS[data.status],
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
      <Topbar title="Fleet" subtitle="Vehicle registry and lifecycle status" />
      <div className="page-content">
        {/* header */}
        <div className="section-header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="field-input" style={{ width: 'auto', fontSize: 12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>In Shop</option>
              <option>Retired</option>
            </select>
            <input
              className="field-input"
              style={{ width: 220, fontSize: 12 }}
              placeholder="Search reg. no. / make / model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {canEdit && (
            <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Vehicle
            </button>
          )}
        </div>

        {/* note */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Rule: Registration No. must be unique · Vehicle status automatically changes on maintenance / trip dispatch
        </div>

        {/* table */}
        <div className="surface">
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Capacity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading vehicles...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--status-red)', padding: 32 }}>Could not load vehicles.</td></tr>
              )}
              {!isLoading && !isError && filtered.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="row-identity">
                      <div className="avatar">{v.make.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="row-identity-name">{v.registrationNumber}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{v.make} {v.model}</div>
                      </div>
                    </div>
                  </td>
                  <td>{v.capacityKg} kg</td>
                  <td><StatusBadge label={VEHICLE_STATUS_TO_LABEL[v.status]} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" onClick={() => openEdit(v)} style={{ padding: '4px 8px' }}>
                          <Pencil size={12} />
                        </button>
                        <button className="btn-danger" onClick={() => setDeleteId(v.id)} style={{ padding: '4px 8px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* add/edit modal */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" form="vehicle-form" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)}>
          {formError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{formError}</span></div>}
          <div className="form-group">
            <label className="field-label">Registration No.</label>
            <input className="field-input" placeholder="e.g. GJ01AB1234" {...register('registrationNumber', { required: 'Required' })} />
            {errors.registrationNumber && <p className="field-error">{errors.registrationNumber.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Make</label>
              <input className="field-input" placeholder="e.g. Tata" {...register('make', { required: 'Required' })} />
              {errors.make && <p className="field-error">{errors.make.message}</p>}
            </div>
            <div className="form-group">
              <label className="field-label">Model</label>
              <input className="field-input" placeholder="e.g. Ace Gold" {...register('model', { required: 'Required' })} />
              {errors.model && <p className="field-error">{errors.model.message}</p>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Capacity (kg)</label>
              <input className="field-input" type="number" placeholder="e.g. 1000" {...register('capacityKg', { required: 'Required', min: 1 })} />
              {errors.capacityKg && <p className="field-error">{errors.capacityKg.message}</p>}
            </div>
            <div className="form-group">
              <label className="field-label">Status</label>
              <select className="field-input" {...register('status')}>
                <option>Available</option>
                <option>In Shop</option>
                <option>Retired</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* delete confirm */}
      <Modal
        open={deleteId !== null}
        title="Delete Vehicle"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Are you sure you want to remove this vehicle from the registry? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
