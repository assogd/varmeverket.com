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

      // Check if we can access cookies for the backend domain
      // Note: document.cookie only shows cookies for current domain, not third-party
      console.log('🔵 Checking session...');
      console.log('🔵 Current domain cookies:', document.cookie || '(none)');
      console.log('🔵 Note: Backend cookies (api.varmeverket.com) won\'t show here due to same-origin policy');

      // Make direct client-side call to backend API
      // The cookie is set for api.varmeverket.com, so it will be sent automatically
      // with credentials: 'include' when making requests to that domain
      const sessionData = await BackendAPI.getSession();
      console.log('✅ Session found:', sessionData);
      setSession(sessionData);
    } catch (err) {
      // 401 means not logged in, which is fine
      if (err instanceof Error && err.message.includes('401')) {
        console.log(`⚠️ Session check returned 401 (retries left: ${retries})`);
        console.log('💡 This usually means:');
        console.log('   1. Cookie not set by backend when clicking magic link');
        console.log('   2. Cookie not accessible due to SameSite/domain restrictions');
        console.log('   3. Cookie expired or invalid');
        console.log('   → Check DevTools → Application → Cookies → api.varmeverket.com');
        
        // If we get 401 and have retries left, wait a bit and retry
        // This handles the case where cookie might not be immediately available after redirect
        if (retries > 0) {
          console.log('⏳ Retrying session check in 500ms...');
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchSession(retries - 1);
        }
        console.log('❌ No session found after retries');
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

