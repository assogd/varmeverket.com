'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getPortalTheme } from '@/config/portalTheme';

// Configuration for dark mode slugs
const DARK_MODE_SLUGS = ['spaces', 'event-spaces', 'studios', 'musikstudios'];

// Configuration for dark mode collections
const DARK_MODE_COLLECTIONS = ['spaces'];

interface UrlBasedThemeProps {
  children: React.ReactNode;
}

/**
 * Component that automatically sets theme based on URL path
 * - Dark mode for authenticated portal pages (dashboard, bokningar, installningar, etc.)
 * - Orange theme for pre-login portal pages (login, registration, etc.)
 * - Dark mode for specific slugs: spaces, event-spaces, co-working, studios
 * - Dark mode for spaces collection pages
 * - Light mode for everything else
 */
export const UrlBasedTheme: React.FC<UrlBasedThemeProps> = ({ children }) => {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  useEffect(() => {
    // First check if it's a portal route (authenticated or pre-login)
    const portalTheme = getPortalTheme(pathname);
    if (portalTheme) {
      setTheme(portalTheme);
      return;
    }

    // Otherwise, check for dark mode slugs/collections
    const shouldUseDarkMode = shouldPathUseDarkMode(pathname);
    setTheme(shouldUseDarkMode ? 'dark' : 'light');
  }, [pathname, setTheme]);

  return <>{children}</>;
};

/**
 * Determines if a given path should use dark mode (non-portal routes)
 */
function shouldPathUseDarkMode(pathname: string): boolean {
  // Remove leading slash and split path segments
  const segments = pathname.replace(/^\//, '').split('/');

  // Check for dark mode slugs in the first segment
  if (segments.length > 0) {
    const firstSegment = segments[0];

    // Check if first segment matches any dark mode slug
    if (DARK_MODE_SLUGS.includes(firstSegment)) {
      return true;
    }

    // Check if first segment matches any dark mode collection
    if (DARK_MODE_COLLECTIONS.includes(firstSegment)) {
      return true;
    }
  }

  return false;
}

/**
 * Hook to check if current path should use dark mode
 */
export const useShouldUseDarkMode = (): boolean => {
  const pathname = usePathname();
  return shouldPathUseDarkMode(pathname);
};

/**
 * Hook to get the theme that should be used for the current path
 */
export const usePathTheme = (): 'light' | 'dark' | 'orange' => {
  const pathname = usePathname();
  const portalTheme = getPortalTheme(pathname);
  if (portalTheme) {
    return portalTheme;
  }
  const shouldUseDarkMode = shouldPathUseDarkMode(pathname);
  return shouldUseDarkMode ? 'dark' : 'light';
};
