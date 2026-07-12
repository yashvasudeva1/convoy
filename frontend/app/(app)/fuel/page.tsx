/* fuel */
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Topbar from '@/components/layout/topbar';
import Modal from '@/components/modal';
import { useForm } from 'react-hook-form';
import { useUser } from '@/components/usercontext';
import AccessDenied from '@/components/accessdenied';
import { Plus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { ApiExpenseLog, ApiFuelLog, ApiTrip, ApiVehicle } from '@/lib/types';

interface FuelFormData {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
}
interface ExpenseFormData {
  vehicleId: string;
  tripId?: string;
  category: string;
  amount: number;
  description?: string;
}

export default function FuelPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [fuelModal, setFuelModal] = useState(false);
  const [expModal, setExpModal] = useState(false);
  const [fuelError, setFuelError] = useState('');
  const [expError, setExpError] = useState('');

  const fuelForm = useForm<FuelFormData>();
  const expForm = useForm<ExpenseFormData>({ defaultValues: { category: 'Toll' } });

  const { data: fuelLogs = [], isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel'],
    queryFn: () => api.get<ApiFuelLog[]>('/fuel'),
  });

  const { data: expenses = [], isLoading: expLoading } = useQuery({
    queryKey: ['expense'],
    queryFn: () => api.get<ApiExpenseLog[]>('/expense'),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<ApiVehicle[]>('/vehicles'),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get<ApiTrip[]>('/trips'),
  });

  const vehicleById = new Map(vehicles.map(v => [v.id, v]));

  const fuelMutation = useMutation({
    mutationFn: (payload: FuelFormData) => api.post<ApiFuelLog>('/fuel', { ...payload, tripId: payload.tripId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel'] });
      setFuelModal(false);
      fuelForm.reset();
      setFuelError('');
    },
    onError: (err: unknown) => setFuelError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  const expenseMutation = useMutation({
    mutationFn: (payload: ExpenseFormData) => api.post<ApiExpenseLog>('/expense', { ...payload, tripId: payload.tripId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      setExpModal(false);
      expForm.reset();
      setExpError('');
    },
    onError: (err: unknown) => setExpError(err instanceof ApiError ? err.message : 'Something went wrong.'),
  });

  if (user?.role !== 'Financial Analyst') return <AccessDenied />;

  const onFuelSubmit = (data: FuelFormData) => {
    setFuelError('');
    fuelMutation.mutate({ ...data, liters: Number(data.liters), cost: Number(data.cost) });
  };

  const onExpSubmit = (data: ExpenseFormData) => {
    setExpError('');
    expenseMutation.mutate({ ...data, amount: Number(data.amount) });
  };

  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOpCost = totalFuel + totalExpense;

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
              {fuelLoading && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Loading...</td></tr>}
              {!fuelLoading && fuelLogs.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{vehicleById.get(f.vehicleId)?.registrationNumber ?? '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {new Date(f.loggedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>{f.liters} L</td>
                  <td>₹{fmt(f.cost)}</td>
                </tr>
              ))}
              {!fuelLoading && fuelLogs.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No fuel logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* other expenses */}
        <div className="surface" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-muted)' }}>
            <span className="section-title">Other Expenses</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expLoading && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Loading...</td></tr>}
              {!expLoading && expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{vehicleById.get(e.vehicleId)?.registrationNumber ?? '—'}</td>
                  <td>{e.category}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{e.description ?? '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{fmt(e.amount)}</td>
                </tr>
              ))}
              {!expLoading && expenses.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No expenses yet.</td></tr>
              )}
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
              Total Operational Cost (Auto) = Fuel + Expenses
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Fuel: ₹{fmt(totalFuel)} + Expenses: ₹{fmt(totalExpense)}
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
            <button className="btn-primary" form="fuel-form" type="submit" disabled={fuelMutation.isPending}>Save</button>
          </>
        }
      >
        <form id="fuel-form" onSubmit={fuelForm.handleSubmit(onFuelSubmit)}>
          {fuelError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{fuelError}</span></div>}
          <div className="form-group">
            <label className="field-label">Vehicle</label>
            <select className="field-input" {...fuelForm.register('vehicleId', { required: true })}>
              <option value="">Select vehicle...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="field-label">Trip (optional)</label>
            <select className="field-input" {...fuelForm.register('tripId')}>
              <option value="">None</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Liters</label>
              <input className="field-input" type="number" placeholder="42" {...fuelForm.register('liters', { required: true })} />
            </div>
            <div className="form-group">
              <label className="field-label">Cost (₹)</label>
              <input className="field-input" type="number" placeholder="3150" {...fuelForm.register('cost', { required: true })} />
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
            <button className="btn-primary" form="exp-form" type="submit" disabled={expenseMutation.isPending}>Save</button>
          </>
        }
      >
        <form id="exp-form" onSubmit={expForm.handleSubmit(onExpSubmit)}>
          {expError && <div className="alert alert-error" style={{ marginBottom: 14 }}><span>{expError}</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="field-label">Vehicle</label>
              <select className="field-input" {...expForm.register('vehicleId', { required: true })}>
                <option value="">Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="field-label">Category</label>
              <select className="field-input" {...expForm.register('category')}>
                <option>Toll</option>
                <option>Parking</option>
                <option>Fine</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="field-label">Trip (optional)</label>
            <select className="field-input" {...expForm.register('tripId')}>
              <option value="">None</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="field-label">Amount (₹)</label>
            <input className="field-input" type="number" placeholder="0" {...expForm.register('amount', { required: true })} />
          </div>
          <div className="form-group">
            <label className="field-label">Description (optional)</label>
            <input className="field-input" placeholder="e.g. Toll at Vadodara" {...expForm.register('description')} />
          </div>
        </form>
      </Modal>
    </>
  );
}
