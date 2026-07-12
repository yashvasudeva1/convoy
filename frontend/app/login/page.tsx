/* login */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/usercontext';
import { api, ApiError } from '@/lib/api';
import { LoginResponse } from '@/lib/types';

const roles = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

const DEMO_PASSWORD = 'password123';
const DEMO_ACCOUNTS = [
  { role: 'Fleet Manager', email: 'fleet.manager@transitops.dev' },
  { role: 'Dispatcher', email: 'dispatcher@transitops.dev' },
  { role: 'Safety Officer', email: 'safety.officer@transitops.dev' },
  { role: 'Financial Analyst', email: 'financial.analyst@transitops.dev' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (emailToUse: string, passwordToUse: string) => {
    setError('');
    if (!emailToUse || !passwordToUse) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/login', { email: emailToUse, password: passwordToUse });
      login(res.token, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    doLogin(demoEmail, DEMO_PASSWORD);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-base)',
      }}
    >
      {/* left panel — hidden on narrow screens via .login-branding media query */}
      <div
        className="login-branding"
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
          padding: '24px 16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
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

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px 16px', fontSize: 14 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Demo accounts (password: {DEMO_PASSWORD})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc.email)}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 12px', textAlign: 'left' }}
                >
                  <span>{acc.role}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
