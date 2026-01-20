/**
 * Admin Authentication Utilities
 * 
 * Utilities for checking admin status and role-based access control
 */

import type { User } from '@/lib/backendApi';

/**
 * Check if a user has admin role
 * 
 * @param user - User object from session
 * @returns true if user has admin role, false otherwise
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.roles) {
    return false;
  }

  // Check for admin role (case-insensitive)
  return user.roles.some(
    role => role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
  );
}

/**
 * Require admin role, throw error if not admin
 * 
 * @param user - User object from session
 * @throws Error if user is not admin
 */
export function requireAdmin(user: User | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
}

/**
 * Get user roles as a readable string
 * 
 * @param user - User object from session
 * @returns Comma-separated list of roles or "No roles"
 */
export function getUserRoles(user: User | null | undefined): string {
  if (!user || !user.roles || user.roles.length === 0) {
    return 'No roles';
  }
  return user.roles.join(', ');
}
