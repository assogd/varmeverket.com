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

  // Show error if there was one (but not 401/400, which are expected when not logged in)
  if (
    error &&
    !error.includes('401') &&
    !error.includes('400') &&
    !error.includes('Not authenticated')
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
            Session Error
          </h2>
          <p className="text-sm mb-4">{error}</p>
          {error.includes('SSL') || error.includes('Network error') ? (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
              <p className="font-semibold mb-1">SSL/Network Issue:</p>
              <p>
                This appears to be a local development SSL certificate issue.
                Try accessing the site via HTTP instead of HTTPS, or configure a
                valid SSL certificate for local development.
              </p>
            </div>
          ) : null}
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

  // Render children optimistically - if not authenticated, redirect will happen
  // No need to show a loading state that flashes on every page load
  return <>{children}</>;
}
