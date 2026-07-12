/* fleet */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import Modal from '@/components/modal';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';

type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
type VehicleType = 'Van' | 'Truck' | 'Mini' | 'Bus';

interface Vehicle {
  id: number;
  regNo: string;
  nameModel: string;
  type: VehicleType;
  capacity: string;
  odometer: string;
  acqCost: string;
  status: VehicleStatus;
}

const initial: Vehicle[] = [
  { id: 1, regNo: 'GJ01AB4521', nameModel: 'VAN-05',   type: 'Van',   capacity: '500 kg',  odometer: '74,000',  acqCost: '6,20,000',  status: 'Available' },
  { id: 2, regNo: 'GJ01AB9981', nameModel: 'TRUCK-11', type: 'Truck', capacity: '5 Ton',   odometer: '182,000', acqCost: '24,50,000', status: 'On Trip' },
  { id: 3, regNo: 'GJ01AB1120', nameModel: 'MINI-03',  type: 'Mini',  capacity: '1 Ton',   odometer: '66,000',  acqCost: '4,10,000',  status: 'In Shop' },
  { id: 4, regNo: 'GJ01AB0087', nameModel: 'VAN-09',   type: 'Van',   capacity: '750 kg',  odometer: '241,900', acqCost: '5,90,000',  status: 'Retired' },
  { id: 5, regNo: 'GJ01CD3312', nameModel: 'TRUCK-04', type: 'Truck', capacity: '3.5 Ton', odometer: '98,400',  acqCost: '18,00,000', status: 'Available' },
  { id: 6, regNo: 'GJ01CD7721', nameModel: 'MINI-08',  type: 'Mini',  capacity: '800 kg',  odometer: '55,200',  acqCost: '3,60,000',  status: 'Available' },
];

interface FormData {
  regNo: string;
  nameModel: string;
  type: VehicleType;
  capacity: string;
  odometer: string;
  acqCost: string;
  status: VehicleStatus;
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initial);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { user } = useUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  if (user.role === 'Safety Officer') return <AccessDenied />;

  const canEdit = user.role === 'Fleet Manager';

  const filtered = vehicles.filter(v => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search && !v.regNo.toLowerCase().includes(search.toLowerCase()) && !v.nameModel.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    reset({ type: 'Van', status: 'Available' });
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    reset(v);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editing) {
      setVehicles(prev => prev.map(v => v.id === editing.id ? { ...v, ...data } : v));
    } else {
      setVehicles(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      setVehicles(prev => prev.filter(v => v.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <>
      <Topbar title="Fleet" />
      <div className="page-content">
        {/* header */}
        <div className="section-header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="field-input" style={{ width: 'auto', fontSize: 12 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">Type: All</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Mini</option>
              <option>Bus</option>
            </select>
            <select className="field-input" style={{ width: 'auto', fontSize: 12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>In Shop</option>
              <option>Retired</option>
            </select>
            <input
              className="field-input"
              style={{ width: 200, fontSize: 12 }}
              placeholder="Search reg. no..."
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
          Rule: Registration No. must be unique · Retired / In Shop vehicles are hidden from Trip Dispatcher
        </div>

        {/* table */}
        <div className="surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg. No. (Unique)</th>
                <th>Name / Model</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Acq. Cost</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{v.regNo}</td>
                  <td style={{ fontWeight: 500 }}>{v.nameModel}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.type}</td>
                  <td>{v.capacity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.odometer} km</td>
                  <td>₹{v.acqCost}</td>
                  <td><StatusBadge label={v.status} /></td>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
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
            <button className="btn-primary" form="vehicle-form" type="submit">
              {editing ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="field-label">Registration No.</label>
            <input className="field-input" placeholder="e.g. GJ01AB1234" {...register('regNo', { required: 'Required' })} />
            {errors.regNo && <p className="field-error">{errors.regNo.message}</p>}
          </div>
          <div className="form-group">
            <label className="field-label">Name / Model</label>
            <input className="field-input" placeholder="e.g. VAN-05" {...register('nameModel', { required: 'Required' })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Type</label>
              <select className="field-input" {...register('type')}>
                <option>Van</option>
                <option>Truck</option>
                <option>Mini</option>
                <option>Bus</option>
              </select>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Capacity</label>
              <input className="field-input" placeholder="e.g. 500 kg" {...register('capacity', { required: 'Required' })} />
            </div>
            <div className="form-group">
              <label className="field-label">Odometer (km)</label>
              <input className="field-input" placeholder="e.g. 74000" {...register('odometer', { required: 'Required' })} />
            </div>
          </div>
          <div className="form-group">
            <label className="field-label">Acquisition Cost (₹)</label>
            <input className="field-input" placeholder="e.g. 620000" {...register('acqCost', { required: 'Required' })} />
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
