/* topbar */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, Search, Check, X, Truck, Users, Route, FileText } from 'lucide-react';
import { useTheme } from '@/components/themecontext';
import { useUser } from '@/components/usercontext';
import { useForm } from 'react-hook-form';
import Modal from '@/components/modal';
import { runSearch, SearchResult } from '@/lib/searchindex';

interface ProfileFormData {
  name: string;
  role: string;
  email: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, message: 'TR001 dispatched — VAN-05 / Alex en route',          time: '2 min ago',  read: false },
  { id: 2, message: 'VAN-05 maintenance record closed, status: Available', time: '18 min ago', read: false },
  { id: 3, message: 'License expiry warning — John DL-44120 (expired)',   time: '1 hr ago',   read: false },
  { id: 4, message: 'TR003 completed — MINI-08 / Priya',                  time: '3 hr ago',   read: true  },
  { id: 5, message: 'New fuel log added for TRUCK-11 (110 L)',             time: '5 hr ago',   read: true  },
];

const typeIcon: Record<SearchResult['type'], React.ReactNode> = {
  vehicle: <Truck size={12} />,
  driver:  <Users size={12} />,
  trip:    <Route size={12} />,
  page:    <FileText size={12} />,
};

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { user, update } = useUser();

  // notifications
  const [notifications, setNotifications]   = useState<Notification[]>(initialNotifications);
  const [notifOpen, setNotifOpen]             = useState(false);
  const notifRef                              = useRef<HTMLDivElement>(null);

  // profile
  const [profileOpen, setProfileOpen]         = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const profileRef                            = useRef<HTMLDivElement>(null);

  // search
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen]           = useState(false);
  const searchRef                             = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  const unreadCount = notifications.filter(n => !n.read).length;

  // close all dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // search handler
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.trim().length === 0) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const results = runSearch(q);
    setSearchResults(results);
    setSearchOpen(results.length > 0);
  }, []);

  const goToResult = (href: string) => {
    router.push(href);
    setSearchQuery('');
    setSearchOpen(false);
  };

  // notifications
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  // profile
  const openEditProfile = () => {
    setProfileOpen(false);
    reset({ name: user.name, role: user.role, email: user.email });
    setProfileModalOpen(true);
  };

  const onProfileSave = (data: ProfileFormData) => {
    update(data);
    setProfileModalOpen(false);
  };

  const signOut = () => {
    setProfileOpen(false);
    router.push('/login');
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header
        style={{
          height: 52,
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* page title */}
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </span>

        {/* right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* search */}
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 12px',
                width: 220,
              }}
            >
              <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchOpen(false); setSearchResults([]); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* search dropdown */}
            {searchOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 300,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                  zIndex: 200,
                }}
              >
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => goToResult(r.href)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-muted)' : 'none',
                      padding: '9px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                      {typeIcon[r.type]}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.sub}</div>
                    </div>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        letterSpacing: '0.04em',
                        textTransform: 'capitalize',
                      }}
                    >
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* theme toggle */}
          <button
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); setSearchOpen(false); }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 6,
                    height: 6,
                    background: '#f85149',
                    borderRadius: '50%',
                    border: '1.5px solid var(--bg-base)',
                  }}
                />
              )}
            </button>

            {/* notification panel */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 340,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          background: '#f85149',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 10,
                          padding: '1px 6px',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 11,
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Check size={10} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 28, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      No notifications
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-muted)',
                        background: n.read ? 'transparent' : 'rgba(56,139,253,0.05)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: n.read ? 'transparent' : 'var(--accent-blue)',
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                          {n.time}
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 2,
                          flexShrink: 0,
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* profile */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); setSearchOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  flexShrink: 0,
                }}
              >
                {user.initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {user.role}
                </div>
              </div>
            </button>

            {/* profile dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 220,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                {/* user header */}
                <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-muted)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '2px 6px',
                      marginTop: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {user.role}
                  </div>
                </div>

                {/* menu items */}
                <div style={{ padding: '6px 0' }}>
                  <button
                    onClick={openEditProfile}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Edit Profile
                  </button>
                  <div style={{ height: 1, background: 'var(--border-muted)', margin: '4px 0' }} />
                  <button
                    onClick={signOut}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontSize: 13,
                      color: 'var(--accent-red)',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* profile edit modal */}
      <Modal
        open={profileModalOpen}
        title="Edit Profile"
        onClose={() => setProfileModalOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setProfileModalOpen(false)}>Cancel</button>
            <button className="btn-primary" form="profile-edit-form" type="submit">Save Changes</button>
          </>
        }
      >
        <form id="profile-edit-form" onSubmit={handleSubmit(onProfileSave)}>
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" {...register('name', { required: true })} />
          </div>
          <div className="form-group">
            <label className="field-label">Role</label>
            <select className="field-input" {...register('role')}>
              <option>Fleet Manager</option>
              <option>Dispatcher</option>
              <option>Safety Officer</option>
              <option>Financial Analyst</option>
            </select>
          </div>
          <div className="form-group">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" {...register('email', { required: true })} />
          </div>
        </form>
      </Modal>
    </>
  );
}
