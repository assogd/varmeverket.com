'use client';

import React, { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { getPathTheme } from '@/config/portalTheme';

const THEMES = ['light', 'dark', 'orange'] as const;

/** Theme used for first paint (from server header). Used by error page to avoid flash. */
export const InitialThemeContext = createContext<'light' | 'dark' | 'orange'>(
  'light'
);

export function useInitialTheme(): 'light' | 'dark' | 'orange' {
  return useContext(InitialThemeContext);
}

interface PathBasedThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme from server (header) for first paint; client pathname wins after mount */
  initialThemeFromHeader?: 'light' | 'dark' | 'orange';
}

/**
 * Wraps next-themes ThemeProvider with forcedTheme derived from the current path.
 * Theme is always path-based; cookie/localStorage is ignored. No flicker:
 * - Server sends correct class via layout (from x-portal-theme header).
 * - next-themes script receives forcedTheme and applies it without reading storage.
 */
export function PathBasedThemeProvider({
  children,
  initialThemeFromHeader,
}: PathBasedThemeProviderProps) {
  const pathname = usePathname();
  const pathTheme = getPathTheme(pathname ?? null);
  const forcedTheme = pathname != null ? pathTheme : (initialThemeFromHeader ?? 'light');
  const initialTheme = initialThemeFromHeader ?? 'light';

  return (
    <InitialThemeContext.Provider value={initialTheme}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        forcedTheme={forcedTheme}
        themes={THEMES}
        storageKey="varmeverket-path-theme"
        enableColorScheme={false}
      >
        {children}
      </ThemeProvider>
    </InitialThemeContext.Provider>
  );
}
