/* fuel */
'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/topbar';
import Modal from '@/components/modal';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { Plus } from 'lucide-react';

interface FuelLog {
  id: number;
  vehicle: string;
  date: string;
  liters: number;
  fuelCost: number;
}

interface Expense {
  id: number;
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
  maintLinked: number;
  total: number;
}

const initFuel: FuelLog[] = [
  { id: 1, vehicle: 'VAN-05',   date: '05 Jul 2026', liters: 42,  fuelCost: 3150 },
  { id: 2, vehicle: 'TRUCK-11', date: '06 Jul 2026', liters: 110, fuelCost: 8400 },
  { id: 3, vehicle: 'MINI-08',  date: '06 Jul 2026', liters: 28,  fuelCost: 2050 },
  { id: 4, vehicle: 'TRUCK-04', date: '07 Jul 2026', liters: 90,  fuelCost: 6900 },
];

const initExpenses: Expense[] = [
  { id: 1, trip: 'TR001', vehicle: 'VAN-05',   toll: 120,  other: 0,   maintLinked: 0,      total: 120 },
  { id: 2, trip: 'TR002', vehicle: 'TRK-12',   toll: 340,  other: 150, maintLinked: 18000, total: 18490 },
  { id: 3, trip: 'TR003', vehicle: 'MINI-08',  toll: 80,   other: 0,   maintLinked: 0,      total: 80 },
];

const vehicles = ['VAN-05', 'TRUCK-11', 'TRUCK-04', 'MINI-08', 'VAN-09'];

interface FuelFormData {
  vehicle: string;
  date: string;
  liters: number;
  fuelCost: number;
}
interface ExpenseFormData {
  trip: string;
  vehicle: string;
  toll: number;
  other: number;
}

export default function FuelPage() {
  const { user } = useUser();
  if (user?.role !== 'Financial Analyst') return <AccessDenied />;

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initFuel);
  const [expenses, setExpenses] = useState<Expense[]>(initExpenses);
  const [fuelModal, setFuelModal] = useState(false);
  const [expModal, setExpModal] = useState(false);

  const fuelForm = useForm<FuelFormData>({ defaultValues: { vehicle: 'VAN-05' } });
  const expForm  = useForm<ExpenseFormData>({ defaultValues: { vehicle: 'VAN-05' } });

  const onFuelSubmit = (data: FuelFormData) => {
    setFuelLogs(prev => [{ ...data, id: Date.now(), liters: Number(data.liters), fuelCost: Number(data.fuelCost) }, ...prev]);
    setFuelModal(false);
    fuelForm.reset();
  };

  const onExpSubmit = (data: ExpenseFormData) => {
    const total = Number(data.toll) + Number(data.other);
    setExpenses(prev => [{ ...data, id: Date.now(), toll: Number(data.toll), other: Number(data.other), maintLinked: 0, total }, ...prev]);
    setExpModal(false);
    expForm.reset();
  };

  const totalFuel    = fuelLogs.reduce((s, f) => s + f.fuelCost, 0);
  const totalMaint   = 26700; // from maintenance data
  const totalOpCost  = totalFuel + totalMaint;

  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <>
      <Topbar title="Fuel & Expenses" />
      <div className="page-content">
        {/* header actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className="btn-primary" onClick={() => setFuelModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Log Fuel
          </button>
          <button className="btn-secondary" onClick={() => setExpModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>

        {/* fuel logs */}
        <div className="surface" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
            <span className="section-title">Fuel Logs</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Liters</th>
                <th>Fuel Cost</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.vehicle}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{f.date}</td>
                  <td>{f.liters} L</td>
                  <td>₹{fmt(f.fuelCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* other expenses */}
        <div className="surface" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
            <span className="section-title">Other Expenses (Toll / Misc)</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Toll</th>
                <th>Other</th>
                <th>Maint. (Linked)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{e.trip}</td>
                  <td>{e.vehicle}</td>
                  <td>₹{fmt(e.toll)}</td>
                  <td>₹{fmt(e.other)}</td>
                  <td style={{ color: e.maintLinked > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    {e.maintLinked > 0 ? `₹${fmt(e.maintLinked)}` : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{fmt(e.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* total operational cost */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Total Operational Cost (Auto) = Fuel + Maintenance
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Fuel: ₹{fmt(totalFuel)} + Maintenance: ₹{fmt(totalMaint)}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{fmt(totalOpCost)}
          </div>
        </div>
      </div>

      {/* fuel log modal */}
      <Modal
        open={fuelModal}
        title="Log Fuel"
        onClose={() => setFuelModal(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setFuelModal(false)}>Cancel</button>
            <button className="btn-primary" form="fuel-form" type="submit">Save</button>
          </>
        }
      >
        <form id="fuel-form" onSubmit={fuelForm.handleSubmit(onFuelSubmit)}>
          <div className="form-group">
            <label className="field-label">Vehicle</label>
            <select className="field-input" {...fuelForm.register('vehicle')}>
              {vehicles.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="field-label">Date</label>
            <input className="field-input" type="date" {...fuelForm.register('date', { required: true })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Liters</label>
              <input className="field-input" type="number" placeholder="42" {...fuelForm.register('liters', { required: true })} />
            </div>
            <div className="form-group">
              <label className="field-label">Cost (₹)</label>
              <input className="field-input" type="number" placeholder="3150" {...fuelForm.register('fuelCost', { required: true })} />
            </div>
          </div>
        </form>
      </Modal>

      {/* expense modal */}
      <Modal
        open={expModal}
        title="Add Expense"
        onClose={() => setExpModal(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setExpModal(false)}>Cancel</button>
            <button className="btn-primary" form="exp-form" type="submit">Save</button>
          </>
        }
      >
        <form id="exp-form" onSubmit={expForm.handleSubmit(onExpSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Trip ID</label>
              <input className="field-input" placeholder="TR001" {...expForm.register('trip', { required: true })} />
            </div>
            <div className="form-group">
              <label className="field-label">Vehicle</label>
              <select className="field-input" {...expForm.register('vehicle')}>
                {vehicles.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Toll (₹)</label>
              <input className="field-input" type="number" placeholder="0" {...expForm.register('toll', { required: true })} />
            </div>
            <div className="form-group">
              <label className="field-label">Other (₹)</label>
              <input className="field-input" type="number" placeholder="0" {...expForm.register('other', { required: true })} />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
