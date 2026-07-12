/* sidebar */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart2,
  Settings,
} from 'lucide-react';
import { useUser } from '@/components/usercontext';

const nav = [
  { label: 'Dashboard',       href: '/dashboard',   icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { label: 'Fleet',           href: '/fleet',        icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Financial Analyst'] },
  { label: 'Drivers',         href: '/drivers',      icon: Users, roles: ['Fleet Manager', 'Safety Officer'] },
  { label: 'Trips',           href: '/trips',        icon: Route, roles: ['Dispatcher', 'Safety Officer'] },
  { label: 'Maintenance',     href: '/maintenance',  icon: Wrench, roles: ['Fleet Manager'] },
  { label: 'Fuel & Expenses', href: '/fuel',         icon: Fuel, roles: ['Financial Analyst'] },
  { label: 'Analytics',       href: '/analytics',    icon: BarChart2, roles: ['Fleet Manager', 'Financial Analyst'] },
  { label: 'Settings',        href: '/settings',     icon: Settings, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const allowedNav = nav.filter(item => item.roles.includes(user.role));

  return (
    <aside
      style={{
        width: 200,
        minWidth: 200,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-muted)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* brand */}
      <div
        style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid var(--border-muted)',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          Convoy
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Fleet Management
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {allowedNav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-hover)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-elevated)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-muted)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        CONVOY © 2026
      </div>
    </aside>
  );
}
