/* user context */
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
}

interface UserCtx {
  user: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  name: 'Raven K.',
  role: 'Dispatcher',
  email: 'raven.k@convoy.in',
  initials: 'RK',
};

const UserContext = createContext<UserCtx>({
  user: defaultUser,
  update: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const update = (patch: Partial<UserProfile>) => {
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
    <UserContext.Provider value={{ user, update }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
