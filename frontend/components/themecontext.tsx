/* theme */
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // read saved pref once on mount
  useEffect(() => {
    const stored = localStorage.getItem('convoy-theme') as Theme | null;
    if (stored && stored !== theme) {
      setTheme(stored);
    }
    // always stamp the attribute so CSS vars activate
    document.documentElement.setAttribute('data-theme', stored ?? 'light');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep attribute in sync whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('convoy-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
