/**
 * Portal Theme Configuration
 *
 * Centralized configuration for portal page themes:
 * - Authenticated portal pages: dark mode
 * - Pre-login pages (login, registration, etc.): orange theme
 * - Site-wide path-based theme (no cookie/storage)
 */

import { PORTAL_ROUTES } from '@/utils/routes';

/** Slugs (first path segment) that use dark mode outside portal */
const DARK_MODE_SLUGS = [
  'spaces',
  'event-spaces',
  'studios',
  'musikstudios',
] as const;
/** Collection segments that use dark mode */
const DARK_MODE_COLLECTIONS = ['spaces'] as const;

/**
 * Pre-login and public routes that should use orange theme
 */
export const PRE_LOGIN_ROUTES = ['/login', '/ansok-om-medlemskap'] as const;

/**
 * Authenticated portal routes that should use dark mode
 * These are all portal routes except pre-login routes
 */
export const AUTHENTICATED_PORTAL_ROUTES = PORTAL_ROUTES.filter(
  route => !PRE_LOGIN_ROUTES.includes(route as (typeof PRE_LOGIN_ROUTES)[number])
);

/**
 * Check if a pathname is a pre-login route
 */
export const isPreLoginRoute = (
  pathname: string | null | undefined
): boolean => {
  if (!pathname) {
    return false;
  }

  return PRE_LOGIN_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Check if a pathname is an authenticated portal route
 */
export const isAuthenticatedPortalRoute = (
  pathname: string | null | undefined
): boolean => {
  if (!pathname) {
    return false;
  }

  return AUTHENTICATED_PORTAL_ROUTES.some(route =>
    pathname.startsWith(route)
  );
};

/**
 * Get the theme for a given pathname (portal only)
 * @returns 'dark' for authenticated portal routes, 'orange' for pre-login routes, null otherwise
 */
export const getPortalTheme = (
  pathname: string | null | undefined
): 'dark' | 'orange' | null => {
  if (isPreLoginRoute(pathname)) {
    return 'orange';
  }

  if (isAuthenticatedPortalRoute(pathname)) {
    return 'dark';
  }

  return null;
};

function shouldPathUseDarkMode(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const segments = pathname.replace(/^\//, '').split('/');
  if (segments.length === 0) return false;
  const first = segments[0];
  return (
    (DARK_MODE_SLUGS as readonly string[]).includes(first) ||
    (DARK_MODE_COLLECTIONS as readonly string[]).includes(first)
  );
}

/**
 * Get the theme for any pathname. Used for path-only theming (no cookie/storage).
 * @returns 'dark' | 'orange' | 'light'
 */
export const getPathTheme = (
  pathname: string | null | undefined
): 'dark' | 'orange' | 'light' => {
  const portal = getPortalTheme(pathname);
  if (portal) return portal;
  return shouldPathUseDarkMode(pathname) ? 'dark' : 'light';
};
