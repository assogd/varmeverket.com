'use client';

import { useState, useEffect } from 'react';
import BackendAPI, { type SessionResponse } from '@/lib/backendApi';

interface UseSessionResult {
  session: SessionResponse | null;
  user: SessionResponse['user'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if user is logged in and get session data
 */
export function useSession(): UseSessionResult {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async (retries = 2) => {
    try {
      setLoading(true);
      setError(null);

      // Make direct client-side call to backend API
      // The cookie is set for api.varmeverket.com, so it will be sent automatically
      // with credentials: 'include' when making requests to that domain
      const sessionData = await BackendAPI.getSession();
      setSession(sessionData);
    } catch (err) {
      // 401 or 400 means not logged in, which is fine
      const isNotAuthenticated =
        (err instanceof Error &&
          (err.message.includes('401') ||
            err.message.includes('400') ||
            err.message.includes('Not authenticated'))) ||
        (err as any)?.status === 401 ||
        (err as any)?.status === 400;

      if (isNotAuthenticated) {
        // Not logged in - this is normal, not an error
        // Note: document.cookie only shows cookies for current domain
        // Session cookies for api.varmeverket.com won't be visible here
        // but will still be sent automatically with credentials: 'include'
        const hasLocalCookies =
          document.cookie.includes('session=') ||
          document.cookie.includes('remember_token=');

        // Log info about the authentication failure
        console.info('ℹ️ Session check: Not authenticated', {
          message: err instanceof Error ? err.message : 'Unknown error',
          status: (err as any)?.status,
          note: hasLocalCookies
            ? 'Local cookies found, but session cookies for api.varmeverket.com are cross-domain and not visible in document.cookie. They are still sent automatically with the request.'
            : 'No local cookies found. Session cookies for api.varmeverket.com are cross-domain and not visible in document.cookie.',
          suggestion:
            'If you were logged in on another app, the session might have expired or be invalid. Try logging in again.',
        });

        // Don't set error for expected authentication failures
        setSession(null);
        setError(null);
      } else {
        // Only log and set error for actual problems (network errors, etc.)
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch session';
        // Only log if it's not a network/SSL error that we can't fix
        if (
          !errorMessage.includes('SSL') &&
          !errorMessage.includes('Network error')
        ) {
          console.error('❌ Session fetch error:', err);
        }
        setError(errorMessage);
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay after page load to ensure cookies are available
    // This handles the case where we just landed from a redirect
    const timer = setTimeout(() => {
      fetchSession();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    session,
    user: session?.user || null,
    loading,
    error,
    refetch: fetchSession,
  };
}
