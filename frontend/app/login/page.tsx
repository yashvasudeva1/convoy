/* login */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, Truck, Users, Route, BarChart2 } from 'lucide-react';
import { useUser } from '@/components/usercontext';
import { api, ApiError } from '@/lib/api';
import { LoginResponse } from '@/lib/types';

const DEMO_PASSWORD = 'password123';
const DEMO_ACCOUNTS = [
  { role: 'Fleet Manager', email: 'fleet.manager@transitops.dev', scope: 'Fleet · Maintenance', icon: Truck },
  { role: 'Dispatcher', email: 'dispatcher@transitops.dev', scope: 'Dashboard · Trips', icon: Route },
  { role: 'Safety Officer', email: 'safety.officer@transitops.dev', scope: 'Drivers · Compliance', icon: Users },
  { role: 'Financial Analyst', email: 'financial.analyst@transitops.dev', scope: 'Fuel & Expenses · Reports', icon: BarChart2 },
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
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-canvas)' }}>
      {/* left panel — brand, hidden on narrow screens via .login-branding media query */}
      <div
        className="login-branding"
        style={{
          width: 420,
          minWidth: 420,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #4c3fd6 0%, #5b4fe0 45%, #7b6ef2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 40px',
          color: '#fff',
        }}
      >
        {/* decorative route rings */}
        <svg
          width="440" height="440" viewBox="0 0 440 440"
          style={{ position: 'absolute', top: -60, right: -140, opacity: 0.18, pointerEvents: 'none' }}
        >
          <circle cx="220" cy="220" r="219" stroke="#fff" strokeWidth="1" fill="none" />
          <circle cx="220" cy="220" r="160" stroke="#fff" strokeWidth="1" fill="none" />
          <circle cx="220" cy="220" r="100" stroke="#fff" strokeWidth="1" fill="none" />
        </svg>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Navigation size={18} fill="#fff" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Convoy</div>
          </div>

          <h1 style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Run your fleet like a control tower, not a spreadsheet.
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, maxWidth: 320 }}>
            Vehicles, drivers, dispatch, maintenance and cost — one system of record for every trip TransitOps runs.
          </p>

          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_ACCOUNTS.map(({ role, scope, icon: Icon }) => (
              <div
                key={role}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 12,
                  padding: '10px 12px',
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(255,255,255,0.14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={14} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{role}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{scope}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 10.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Convoy © 2026 · RBAC Enabled
        </div>
      </div>

      {/* right panel — form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
              Sign in to your TransitOps workspace
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
              style={{ width: '100%', padding: '11px 16px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Demo accounts &middot; password: {DEMO_PASSWORD}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc.email)}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '9px 12px', textAlign: 'left', borderRadius: 10 }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{acc.role}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
