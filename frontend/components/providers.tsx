/* providers */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { ThemeProvider } from './themecontext';
import { UserProvider } from './usercontext';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
