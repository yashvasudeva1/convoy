/* trips */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import { Truck, ArrowRight, XCircle, Route as RouteIcon, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';

type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle: string;
  driver: string;
  cargoKg: number;
  distanceKm: number;
  status: TripStatus;
  eta: string;
}

const availableVehicles = [
  { id: 'VAN-05',   capacity: 500,   label: 'VAN-05 — 500 kg capacity' },
  { id: 'MINI-08',  capacity: 800,   label: 'MINI-08 — 800 kg capacity' },
  { id: 'TRUCK-04', capacity: 3500,  label: 'TRUCK-04 — 3,500 kg capacity' },
  { id: 'VAN-09',   capacity: 750,   label: 'VAN-09 — 750 kg capacity' },
];

const availableDrivers = ['Alex', 'Priya', 'Kavita'];

const initialTrips: Trip[] = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub',     vehicle: 'VAN-05',   driver: 'Alex',  cargoKg: 420, distanceKm: 28, status: 'Dispatched', eta: '45 min' },
  { id: 'TR004', source: 'Vatva Industrial',  destination: 'Sanand Warehouse',  vehicle: 'TRUCK-04', driver: 'Suresh',cargoKg: 2800,distanceKm: 45, status: 'Draft',      eta: 'Awaiting driver' },
  { id: 'TR006', source: 'Mansa',             destination: 'Kalol Depot',       vehicle: '—',        driver: '—',     cargoKg: 0,   distanceKm: 0,  status: 'Cancelled',  eta: 'Vehicle went to shop' },
  { id: 'TR002', source: 'Ahmedabad Hub',     destination: 'Gandhinagar Depot', vehicle: 'TRK-12',   driver: 'John',  cargoKg: 900, distanceKm: 28, status: 'Completed',  eta: '—' },
];

interface FormData {
  source: string;
  destination: string;
  vehicleId: string;
  driver: string;
  cargoKg: number;
  distanceKm: number;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);

  const { user } = useUser();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { vehicleId: 'VAN-05', cargoKg: 0, distanceKm: 0 },
  });

  if (user.role === 'Fleet Manager' || user.role === 'Financial Analyst') return <AccessDenied />;

  const canEdit = user.role === 'Dispatcher';

  const selectedVehicleId = watch('vehicleId');
  const cargoKg = watch('cargoKg');
  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
  const capacityExceeded = selectedVehicle && Number(cargoKg) > selectedVehicle.capacity;

  const onSubmit = (data: FormData) => {
    const v = availableVehicles.find(v => v.id === data.vehicleId);
    const exceeded = v && Number(data.cargoKg) > v.capacity;
    if (exceeded) return;
    const newTrip: Trip = {
      id: `TR${String(trips.length + 1).padStart(3, '0')}X`,
      source: data.source,
      destination: data.destination,
      vehicle: data.vehicleId,
      driver: data.driver,
      cargoKg: Number(data.cargoKg),
      distanceKm: Number(data.distanceKm),
      status: 'Draft',
      eta: 'Awaiting dispatch',
    };
    setTrips(prev => [newTrip, ...prev]);
    reset({ vehicleId: 'VAN-05', cargoKg: 0, distanceKm: 0 });
  };

  const dispatch = (id: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Dispatched', eta: '~1h' } : t));
  };

  const complete = (id: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed', eta: '—' } : t));
  };

  const cancel = (id: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'Cancelled', eta: '—' } : t));
  };

  return (
    <>
      <Topbar title="Trips" />
      <div className="page-content">
        {/* lifecycle header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span className="section-title">Trip Lifecycle</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
            {(['Draft', 'Dispatched', 'Completed', 'Cancelled'] as TripStatus[]).map((s, i, arr) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusBadge label={s} />
                {i < arr.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
          {/* create trip form */}
          {canEdit && (
            <div className="surface">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
                <span className="section-title">Create Trip</span>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16 }}>
                <div className="form-group">
                  <label className="field-label">Source</label>
                  <input className="field-input" placeholder="Gandhinagar Depot" {...register('source', { required: 'Required' })} />
                  {errors.source && <p className="field-error">{errors.source.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Destination</label>
                  <input className="field-input" placeholder="Ahmedabad Hub" {...register('destination', { required: 'Required' })} />
                  {errors.destination && <p className="field-error">{errors.destination.message}</p>}
                </div>
                <div className="form-group">
                  <label className="field-label">Vehicle (Available only)</label>
                  <select className="field-input" {...register('vehicleId')}>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="field-label">Driver (Available only)</label>
                  <select className="field-input" {...register('driver')}>
                    {availableDrivers.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="field-label">Cargo Weight (kg)</label>
                    <input className="field-input" type="number" placeholder="0" {...register('cargoKg', { required: 'Required', min: 0 })} />
                  </div>
                  <div className="form-group">
                    <label className="field-label">Planned Distance (km)</label>
                    <input className="field-input" type="number" placeholder="0" {...register('distanceKm', { required: 'Required', min: 0 })} />
                  </div>
                </div>

                {/* validation alert */}
                {capacityExceeded && selectedVehicle && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div>Vehicle Capacity: {selectedVehicle.capacity} kg</div>
                      <div>Cargo Weight: {cargoKg} kg</div>
                      <div style={{ marginTop: 4, fontWeight: 600 }}>
                        Capacity exceeded by {Number(cargoKg) - selectedVehicle.capacity} kg — dispatch blocked
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!!capacityExceeded}
                    style={{ flex: 1 }}
                  >
                    Dispatch
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => reset()}>
                    Cancel
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
              {trips.map((t, i) => (
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
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>{t.id}</span>
                        <StatusBadge label={t.status} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                        {t.source} → {t.destination}
                      </div>
                      {t.vehicle !== '—' && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {t.vehicle} / {t.driver} · {t.cargoKg} kg · {t.distanceKm} km
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{t.eta}</div>
                      {canEdit && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {t.status === 'Draft' && (
                            <button className="btn-primary" onClick={() => dispatch(t.id)} style={{ padding: '4px 10px', fontSize: 11 }}>
                              Dispatch
                            </button>
                          )}
                          {t.status === 'Dispatched' && (
                            <button
                              className="btn-ghost"
                              onClick={() => complete(t.id)}
                              style={{ padding: '4px 10px', fontSize: 11, color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                            >
                              <CheckCircle size={11} style={{ marginRight: 4, display: 'inline' }} />
                              Complete
                            </button>
                          )}
                          {(t.status === 'Draft' || t.status === 'Dispatched') && (
                            <button className="btn-danger" onClick={() => cancel(t.id)} style={{ padding: '4px 10px', fontSize: 11 }}>
                              <XCircle size={11} style={{ marginRight: 4, display: 'inline' }} />
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-muted)', fontSize: 11, color: 'var(--text-muted)' }}>
              On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
