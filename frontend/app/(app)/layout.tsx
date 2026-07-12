/* shell */
'use client';

import Sidebar from '@/components/layout/sidebar';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/usercontext';
import { SidebarProvider } from '@/components/layout/sidebarcontext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useUser();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="page-root">
        <Sidebar />
        <div className="page-main">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
