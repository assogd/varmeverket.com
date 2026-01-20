/**
 * useUser Hook
 * 
 * Hook for fetching and managing user data with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserByEmail, updateUser, type UpdateUserData } from '@/services/userService';
import type { User } from '@/lib/backendApi';
import { handleAPIError, isAuthError } from '@/utils/apiErrorHandler';

interface UseUserOptions {
  email: string | null;
  enabled?: boolean; // Whether to fetch automatically
  refetchOnMount?: boolean; // Whether to refetch when component mounts
}

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: UpdateUserData) => Promise<User>;
  isUpdating: boolean;
}

// Simple in-memory cache
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and manage user data
 */
export function useUser(options: UseUserOptions): UseUserResult {
  const { email, enabled = true, refetchOnMount = true } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUser = useCallback(async () => {
    if (!email || !enabled) {
      setUser(null);
      setError(null);
      return;
    }

    // Check cache first
    const cached = userCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUser(cached.user);
      setError(null);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const userData = await getUserByEmail(email);
      setUser(userData);
      setError(null);

      // Update cache
      userCache.set(email, { user: userData, timestamp: Date.now() });
    } catch (err) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = handleAPIError(err, {
        on401: () => {
          // Clear cache on auth error
          userCache.delete(email);
        },
      });

      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [email, enabled]);

  const updateUserData = useCallback(
    async (data: UpdateUserData): Promise<User> => {
      if (!email) {
        throw new Error('Email is required to update user');
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updatedUser = await updateUser(email, data);
        setUser(updatedUser);

        // Update cache
        userCache.set(email, { user: updatedUser, timestamp: Date.now() });

        return updatedUser;
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [email]
  );

  useEffect(() => {
    if (refetchOnMount) {
      fetchUser();
    }

    return () => {
      // Cleanup: abort pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUser, refetchOnMount]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    update: updateUserData,
    isUpdating,
  };
}

/**
 * Clear user cache (useful after logout or when data might be stale)
 */
export function clearUserCache(email?: string): void {
  if (email) {
    userCache.delete(email);
  } else {
    userCache.clear();
  }
}
