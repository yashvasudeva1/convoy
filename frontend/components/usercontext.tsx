/* user context */
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { clearSession, getStoredUser, getToken, setSession } from '@/lib/api';
import { ROLE_TO_LABEL } from '@/lib/mappings';
import { ApiRole, ApiUser } from '@/lib/types';

export interface UserProfile {
  name: string;
  role: string;
  apiRole: ApiRole | null;
  email: string;
  initials: string;
}

const guestUser: UserProfile = { name: '', role: '', apiRole: null, email: '', initials: '' };

function toProfile(u: ApiUser): UserProfile {
  const parts = u.name.trim().split(' ');
  const initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);
  return { name: u.name, email: u.email, apiRole: u.role, role: ROLE_TO_LABEL[u.role], initials };
}

interface UserCtx {
  user: UserProfile;
  isAuthenticated: boolean;
  ready: boolean;
  login: (token: string, apiUser: ApiUser) => void;
  logout: () => void;
  update: (patch: Partial<Pick<UserProfile, 'name' | 'email'>>) => void;
}

const UserContext = createContext<UserCtx>({
  user: guestUser,
  isAuthenticated: false,
  ready: false,
  login: () => {},
  logout: () => {},
  update: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(guestUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(toProfile(stored));
    }
    setReady(true);
  }, []);

  const login = (token: string, apiUser: ApiUser) => {
    setSession(token, apiUser);
    setUser(toProfile(apiUser));
  };

  const logout = () => {
    clearSession();
    setUser(guestUser);
  };

  const update = (patch: Partial<Pick<UserProfile, 'name' | 'email'>>) => {
    setUser(prev => {
      const updated = { ...prev, ...patch };
      // auto-generate initials from name if name changed
      if (patch.name) {
        const parts = patch.name.trim().split(' ');
        updated.initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);
      }
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: user.apiRole !== null, ready, login, logout, update }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
