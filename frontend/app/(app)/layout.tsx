/* shell */
import Sidebar from '@/components/layout/sidebar';
import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-root">
      <Sidebar />
      <div className="page-main">
        {children}
      </div>
    </div>
  );
}
