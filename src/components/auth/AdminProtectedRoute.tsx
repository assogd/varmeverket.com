'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { isAdminUser } from '@/lib/adminAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loginRedirect?: string;
}

/**
 * Wraps admin UI: must be logged in (ProtectedRoute) and have an admin role
 * (staff | team | system per backend policy). Others are sent to redirectTo.
 */
export default function AdminProtectedRoute({
  children,
  redirectTo = '/dashboard',
  loginRedirect = '/login',
}: AdminProtectedRouteProps) {
  const { user, loading, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loginRedirect);
      return;
    }
    if (!isAdminUser(user)) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo, loginRedirect]);

  if (
    error &&
    !error.includes('401') &&
    !error.includes('400') &&
    !error.includes('Not authenticated')
  ) {
    return (
      <ProtectedRoute redirectTo={loginRedirect}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-sm text-text/70 dark:text-dark-text/70">{error}</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Wait for session before showing admin chrome
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-text/70 dark:text-dark-text/70">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdminUser(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-text/70 dark:text-dark-text/70">
          Redirecting…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
