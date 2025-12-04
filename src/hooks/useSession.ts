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
      const isNotAuthenticated = err instanceof Error && (
        err.message.includes('401') || 
        err.message.includes('400') ||
        err.message.includes('Not authenticated') ||
        (err as any).status === 401 ||
        (err as any).status === 400
      );
      
      if (isNotAuthenticated) {
        // Not logged in - this is normal, not an error
        // Don't retry for 400/401 - user is simply not authenticated
        setSession(null);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session';
        console.error('❌ Session fetch error:', err);
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

