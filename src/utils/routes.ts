/**
 * Portal routes that require authentication and have special UI treatment
 */
export const PORTAL_ROUTES = [
  '/dashboard',
  '/bokningar',
  '/installningar',
  '/login',
  '/portal/admin',
] as const;

/**
 * Check if a given pathname is a portal route
 * @param pathname - The pathname to check (can be null/undefined)
 * @returns true if the pathname is a portal route, false otherwise
 */
export const isPortalRoute = (pathname: string | null | undefined): boolean => {
  if (!pathname) {
    return false;
  }

  return PORTAL_ROUTES.some(route => pathname.startsWith(route));
};
