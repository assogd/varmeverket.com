/**
 * Portal Theme Configuration
 *
 * Centralized configuration for portal page themes:
 * - Authenticated portal pages: dark mode
 * - Pre-login pages (login, registration, etc.): orange theme
 */

import { PORTAL_ROUTES } from '@/utils/routes';

/**
 * Pre-login routes that should use orange theme
 * These are portal routes that don't require authentication
 */
export const PRE_LOGIN_ROUTES = ['/login'] as const;

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
 * Get the theme for a given pathname
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
