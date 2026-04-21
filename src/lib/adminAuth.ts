/**
 * Admin access is role-based by backend role policy.
 * Users with staff, team, or system may use admin tooling.
 */
import type { User } from '@/lib/backendApi';

export const ADMIN_ROLES = ['staff', 'team', 'system'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.roles?.length) return false;
  const set = new Set(user.roles.map(r => r.toLowerCase()));
  return ADMIN_ROLES.some(role => set.has(role));
}
