'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { getPathTheme } from '@/config/portalTheme';

const THEMES = ['light', 'dark', 'orange'] as const;

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

  return (
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
  );
}
