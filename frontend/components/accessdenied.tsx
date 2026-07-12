/* access denied */
'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
    }}>
      <ShieldAlert size={48} color="var(--accent-red)" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Access Denied
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 320 }}>
        Your current role does not have permission to view this page. If you believe this is a mistake, contact your administrator.
      </p>
      <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
