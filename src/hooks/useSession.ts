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

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await BackendAPI.getSession();
      setSession(sessionData);
    } catch (err) {
      // 401 means not logged in, which is fine
      if (err instanceof Error && err.message.includes('401')) {
        setSession(null);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    session,
    user: session?.user || null,
    loading,
    error,
    refetch: fetchSession,
  };
}

