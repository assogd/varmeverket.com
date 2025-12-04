'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that protects routes - redirects to login if not authenticated
 */
export default function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading, error } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Checking session...</p>
        </div>
      </div>
    );
  }

  // Show error if there was one (but not 401, which is expected)
  if (error && !error.includes('401')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
            Session Error
          </h2>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

