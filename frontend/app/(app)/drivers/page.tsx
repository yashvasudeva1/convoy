/* drivers */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import StatusBadge from '@/components/statusbadge';
import Modal from '@/components/modal';
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';

type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

interface Driver {
  id: number;
  name: string;
  licenseNo: string;
  category: string;
  expiry: string;
  contact: string;
  tripCompl: string;
  safety: string;
  status: DriverStatus;
}

const isExpired = (expiry: string) => {
  const [m, y] = expiry.split('/');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d < new Date();
};

const initial: Driver[] = [
  { id: 1, name: 'Alex',   licenseNo: 'DL-88213', category: 'LMV', expiry: '12/2028', contact: '98765xxxxx', tripCompl: '96%', safety: '92',  status: 'Available' },
  { id: 2, name: 'John',   licenseNo: 'DL-44120', category: 'HMV', expiry: '03/2025', contact: '98220xxxxx', tripCompl: '81%', safety: '74',  status: 'Suspended' },
  { id: 3, name: 'Priya',  licenseNo: 'DL-77031', category: 'LMV', expiry: '08/2027', contact: '99110xxxxx', tripCompl: '99%', safety: '97',  status: 'On Trip' },
  { id: 4, name: 'Suresh', licenseNo: 'DL-90045', category: 'HMV', expiry: '01/2027', contact: '97440xxxxx', tripCompl: '88%', safety: '85',  status: 'Off Duty' },
  { id: 5, name: 'Kavita', licenseNo: 'DL-55310', category: 'LMV', expiry: '06/2029', contact: '96330xxxxx', tripCompl: '94%', safety: '90',  status: 'Available' },
];

interface FormData {
  name: string;
  licenseNo: string;
  category: string;
  expiry: string;
  contact: string;
  safety: string;
  status: DriverStatus;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { user } = useUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  if (user.role === 'Dispatcher' || user.role === 'Financial Analyst') return <AccessDenied />;

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNo.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    reset({ category: 'LMV', status: 'Available' });
    setModalOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    reset(d);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, ...data } : d));
    } else {
      setDrivers(prev => [...prev, { ...data, id: Date.now(), tripCompl: '0%' }]);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      setDrivers(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
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
          <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Driver
          </button>
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
                <th>Category</th>
                <th>Expiry</th>
                <th>Contact</th>
                <th>Trip Compl.</th>
                <th>Safety</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const expired = isExpired(d.expiry);
                const safetyNum = parseInt(d.safety);
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.licenseNo}</td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: d.category === 'HMV' ? 'var(--accent-blue-dim)' : 'var(--accent-gray-dim)',
                        color: d.category === 'HMV' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        padding: '2px 6px',
                        borderRadius: 3,
                      }}>
                        {d.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: expired ? 'var(--accent-red)' : 'var(--text-primary)' }}>{d.expiry}</span>
                        {expired && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--accent-red)', fontWeight: 700 }}>
                            <AlertTriangle size={10} /> EXPIRED
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{d.contact}</td>
                    <td>{d.tripCompl}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 60,
                          height: 4,
                          background: 'var(--border-muted)',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${safetyNum}%`,
                            background: safetyNum >= 90 ? 'var(--accent-green)' : safetyNum >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.safety}</span>
                      </div>
                    </td>
                    <td><StatusBadge label={d.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" onClick={() => openEdit(d)} style={{ padding: '4px 8px' }}>
                          <Pencil size={12} />
                        </button>
                        <button className="btn-danger" onClick={() => setDeleteId(d.id)} style={{ padding: '4px 8px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No drivers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* status toggle legend */}
        <div style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Toggle Status</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Available', 'On Trip', 'Off Duty', 'Suspended'] as DriverStatus[]).map(s => (
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
            <button className="btn-primary" form="driver-form" type="submit">
              {editing ? 'Save Changes' : 'Add Driver'}
            </button>
          </>
        }
      >
        <form id="driver-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" placeholder="Driver name" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">License No.</label>
              <input className="field-input" placeholder="DL-XXXXX" {...register('licenseNo', { required: 'Required' })} />
            </div>
            <div className="form-group">
              <label className="field-label">Category</label>
              <select className="field-input" {...register('category')}>
                <option>LMV</option>
                <option>HMV</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">License Expiry (MM/YYYY)</label>
              <input className="field-input" placeholder="12/2028" {...register('expiry', { required: 'Required' })} />
            </div>
            <div className="form-group">
              <label className="field-label">Contact</label>
              <input className="field-input" placeholder="9876500000" {...register('contact', { required: 'Required' })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Safety Score (0–100)</label>
              <input className="field-input" type="number" placeholder="85" {...register('safety', { required: 'Required' })} />
            </div>
            <div className="form-group">
              <label className="field-label">Status</label>
              <select className="field-input" {...register('status')}>
                <option>Available</option>
                <option>Off Duty</option>
                <option>Suspended</option>
              </select>
            </div>
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
