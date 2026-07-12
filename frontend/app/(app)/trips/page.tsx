/* trips */
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import { ArrowRight, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { api, ApiError } from '@/lib/api';
import { TRIP_STATUS_TO_LABEL } from '@/lib/mappings';
import { ApiDriver, ApiTrip, ApiVehicle } from '@/lib/types';

interface FormData {
  origin: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
}

export default function TripsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { cargoWeightKg: 0 },
  });

  const { data: trips = [], isLoading, isError } = useQuery({
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

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE' && !d.isLicenseExpired);
  const vehicleById = new Map(vehicles.map(v => [v.id, v]));
  const driverById = new Map(drivers.map(d => [d.id, d]));

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => api.post<ApiTrip>('/trips', payload),
    onSuccess: () => {
      invalidateAll();
      reset({ vehicleId: '', driverId: '', cargoWeightKg: 0, origin: '', destination: '' });
      setFormError('');
    },
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => api.patch<ApiTrip>(`/trips/${id}/dispatch`, {}),
    onSuccess: invalidateAll,
    onError: (err: unknown) => setFormError(err instanceof ApiError ? err.message : 'Could not dispatch trip.'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch<ApiTrip>(`/trips/${id}/complete`, {}),
    onSuccess: invalidateAll,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch<ApiTrip>(`/trips/${id}/cancel`, {}),
    onSuccess: invalidateAll,
  });

  if (user.role === 'Fleet Manager' || user.role === 'Financial Analyst') return <AccessDenied />;

  const canEdit = user.role === 'Dispatcher';

  const selectedVehicleId = watch('vehicleId');
  const cargoWeightKg = watch('cargoWeightKg');
  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
  const capacityExceeded = selectedVehicle && Number(cargoWeightKg) > selectedVehicle.capacityKg;

  const onSubmit = (data: FormData) => {
    setFormError('');
    createMutation.mutate({ ...data, cargoWeightKg: Number(data.cargoWeightKg) });
  };

  return (
    <>
      <Topbar title="Trips" />
      <div className="page-content">
        {/* lifecycle header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span className="section-title">Trip Lifecycle</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
            {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((s, i, arr) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusBadge label={s} />
                {i < arr.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
              </span>
            ))}
          </div>
        </div>

        <div className="split-panel" style={{ gridTemplateColumns: '340px 1fr', gap: 16 }}>
          {/* create trip form */}
          {canEdit && (
            <div className="surface">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
                <span className="section-title">Create Trip</span>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16 }}>
                {formError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{formError}</span></div>}
                <div className="form-group">
                  <label className="field-label">Source</label>
                  <input className="field-input" placeholder="Gandhinagar Depot" {...register('origin', { required: 'Required' })} />
                  {errors.origin && <p className="field-error">{errors.origin.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Destination</label>
                  <input className="field-input" placeholder="Ahmedabad Hub" {...register('destination', { required: 'Required' })} />
                  {errors.destination && <p className="field-error">{errors.destination.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Vehicle (Available only)</label>
                  <select className="field-input" {...register('vehicleId', { required: 'Required' })}>
                    <option value="">Select vehicle...</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacityKg} kg capacity</option>
                    ))}
                  </select>
                  {errors.vehicleId && <p className="field-error">{errors.vehicleId.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Driver (Available only)</label>
                  <select className="field-input" {...register('driverId', { required: 'Required' })}>
                    <option value="">Select driver...</option>
                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  {errors.driverId && <p className="field-error">{errors.driverId.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Cargo Weight (kg)</label>
                  <input className="field-input" type="number" placeholder="0" {...register('cargoWeightKg', { required: 'Required', min: 0 })} />
                </div>

                {/* validation alert */}
                {capacityExceeded && selectedVehicle && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div>Vehicle Capacity: {selectedVehicle.capacityKg} kg</div>
                      <div>Cargo Weight: {cargoWeightKg} kg</div>
                      <div style={{ marginTop: 4, fontWeight: 600 }}>
                        Capacity exceeded by {Number(cargoWeightKg) - selectedVehicle.capacityKg} kg — dispatch blocked
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!!capacityExceeded || createMutation.isPending}
                    style={{ flex: 1 }}
                  >
                    Create Trip
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => reset()}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* live board */}
          <div className="surface" style={{ gridColumn: canEdit ? 'auto' : '1 / -1' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
              <span className="section-title">Live Board</span>
            </div>
            <div>
              {isLoading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading trips...</div>}
              {isError && <div style={{ padding: 32, textAlign: 'center', color: 'var(--accent-red)' }}>Could not load trips.</div>}
              {!isLoading && !isError && trips.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No trips yet.</div>
              )}
              {!isLoading && !isError && trips.map((t, i) => {
                const vehicle = vehicleById.get(t.vehicleId);
                const driver = driverById.get(t.driverId);
                return (
                  <div
                    key={t.id}
                    style={{
                      padding: '14px 16px',
                      borderBottom: i < trips.length - 1 ? '1px solid var(--border-muted)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>{t.id.slice(0, 8)}</span>
                          <StatusBadge label={TRIP_STATUS_TO_LABEL[t.status]} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                          {t.origin} → {t.destination}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {vehicle?.registrationNumber ?? '—'} / {driver?.name ?? '—'} · {t.cargoWeightKg} kg
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {canEdit && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {t.status === 'PENDING' && (
                              <button className="btn-primary" onClick={() => dispatchMutation.mutate(t.id)} disabled={dispatchMutation.isPending} style={{ padding: '4px 10px', fontSize: 11 }}>
                                Dispatch
                              </button>
                            )}
                            {t.status === 'DISPATCHED' && (
                              <button
                                className="btn-ghost"
                                onClick={() => completeMutation.mutate(t.id)}
                                disabled={completeMutation.isPending}
                                style={{ padding: '4px 10px', fontSize: 11, color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                              >
                                <CheckCircle size={11} style={{ marginRight: 4, display: 'inline' }} />
                                Complete
                              </button>
                            )}
                            {(t.status === 'PENDING' || t.status === 'DISPATCHED') && (
                              <button className="btn-danger" onClick={() => cancelMutation.mutate(t.id)} disabled={cancelMutation.isPending} style={{ padding: '4px 10px', fontSize: 11 }}>
                                <XCircle size={11} style={{ marginRight: 4, display: 'inline' }} />
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-muted)', fontSize: 11, color: 'var(--text-muted)' }}>
              On Complete: Vehicle & Driver return to Available
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
