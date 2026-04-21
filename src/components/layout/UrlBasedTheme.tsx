'use client';

import { usePathname } from 'next/navigation';
import { getPathTheme } from '@/config/portalTheme';

interface UrlBasedThemeProps {
  children: React.ReactNode;
}

/**
 * Pass-through wrapper. Theme is now driven by PathBasedThemeProvider (forcedTheme from path).
 * Kept for backwards compatibility; hooks below use path-based theme.
 */
export const UrlBasedTheme: React.FC<UrlBasedThemeProps> = ({ children }) => (
  <>{children}</>
);

/**
 * Hook to check if current path should use dark mode (non-portal routes)
 */
export const useShouldUseDarkMode = (): boolean => {
  const pathname = usePathname();
  const theme = getPathTheme(pathname ?? null);
  return theme === 'dark';
};

/**
 * Hook to get the theme that should be used for the current path
 */
export const usePathTheme = (): 'light' | 'dark' | 'orange' => {
  const pathname = usePathname();
  return getPathTheme(pathname ?? null);
};
