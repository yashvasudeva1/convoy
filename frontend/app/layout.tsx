/* root layout */
import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'Convoy — Smart Transport Operations Platform',
  description: 'Fleet and transport management system for dispatchers, fleet managers, safety officers and financial analysts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
