/* mobile sidebar toggle state, shared between Sidebar and Topbar */
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextValue {
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const value: SidebarContextValue = {
    mobileOpen,
    open: () => setMobileOpen(true),
    close: () => setMobileOpen(false),
    toggle: () => setMobileOpen(prev => !prev),
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
