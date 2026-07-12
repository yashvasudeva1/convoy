/* login */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/usercontext';
import { api, ApiError } from '@/lib/api';
import { LoginResponse } from '@/lib/types';

const roles = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/login', { email, password });
      login(res.token, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-base)',
      }}
    >
      {/* left panel */}
      <div
        style={{
          width: 380,
          minWidth: 380,
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-muted)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
        }}
      >
        <div>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Convoy
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Smart Transport Operations Platform
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 40, height: 2, background: 'var(--border)', marginBottom: 24 }} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              One login, four roles:
            </p>
            <ul style={{ listStyle: 'none', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roles.map(r => (
                <li key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Access scope by role
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { role: 'Fleet Manager', scope: 'Fleet, Maintenance' },
                { role: 'Dispatcher', scope: 'Dashboard, Trips' },
                { role: 'Safety Officer', scope: 'Drivers, Compliance' },
                { role: 'Financial Analyst', scope: 'Fuel & Expenses, Analytics' },
              ].map(item => (
                <div key={item.role} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.role}</span>
                  <span style={{ color: 'var(--text-muted)' }}> — {item.scope}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          CONVOY © 2026 · RBAC Enabled
        </div>
      </div>

      {/* right panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ width: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Sign in to Convoy
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@transitops.in"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--accent-blue)' }} />
                Remember me
              </label>
              <a href="#" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px 16px', fontSize: 14 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
