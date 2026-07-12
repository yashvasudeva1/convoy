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
  Navigation,
} from 'lucide-react';
import { useUser } from '@/components/usercontext';
import { useSidebar } from '@/components/layout/sidebarcontext';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Fleet', href: '/fleet', icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Financial Analyst'] },
      { label: 'Drivers', href: '/drivers', icon: Users, roles: ['Fleet Manager', 'Safety Officer'] },
      { label: 'Trips', href: '/trips', icon: Route, roles: ['Dispatcher', 'Safety Officer'] },
      { label: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['Fleet Manager', 'Safety Officer'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fuel & Expenses', href: '/fuel', icon: Fuel, roles: ['Financial Analyst'] },
      { label: 'Analytics', href: '/analytics', icon: BarChart2, roles: ['Fleet Manager', 'Financial Analyst'] },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { mobileOpen, close } = useSidebar();

  const visibleGroups = groups
    .map(g => ({ ...g, items: g.items.filter(item => item.roles.includes(user.role)) }))
    .filter(g => g.items.length > 0);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay sidebar-overlay-open" onClick={close} />}
      <aside
        className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}
        style={{
          width: 236,
          minWidth: 236,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '20px 18px',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Navigation size={16} color="var(--accent-text)" strokeWidth={2.4} fill="var(--accent-text)" />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Convoy
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginTop: 2,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              TransitOps
            </div>
          </div>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
          {visibleGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '0 10px',
                  marginBottom: 6,
                }}
              >
                {group.label}
              </div>
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 9,
                      marginBottom: 2,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      background: active ? 'var(--accent-soft)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-hover)';
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
                    <Icon size={15} strokeWidth={2} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* user footer card */}
        <div
          style={{
            margin: 12,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div className="avatar">{user.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name || 'User'}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
