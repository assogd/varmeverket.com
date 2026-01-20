/**
 * useBookings Hook
 * 
 * Hook for fetching and managing bookings with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUserBookings,
  createBooking,
  deleteBooking,
  type CreateBookingData,
} from '@/services/bookingService';
import type { Booking } from '@/lib/backendApi';
import { handleAPIError } from '@/utils/apiErrorHandler';

interface UseBookingsOptions {
  email: string | null;
  enabled?: boolean; // Whether to fetch automatically
  refetchOnMount?: boolean; // Whether to refetch when component mounts
}

interface UseBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: CreateBookingData) => Promise<Booking>;
  remove: (bookingIdx: number) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
}

// Simple in-memory cache
const bookingsCache = new Map<string, { bookings: Booking[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (bookings change more frequently)

/**
 * Hook to fetch and manage bookings
 */
export function useBookings(options: UseBookingsOptions): UseBookingsResult {
  const { email, enabled = true, refetchOnMount = true } = options;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!email || !enabled) {
      setBookings([]);
      setError(null);
      return;
    }

    // Check cache first
    const cached = bookingsCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setBookings(cached.bookings);
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
      const bookingsData = await getUserBookings(email);
      setBookings(bookingsData);
      setError(null);

      // Update cache
      bookingsCache.set(email, {
        bookings: bookingsData,
        timestamp: Date.now(),
      });
    } catch (err) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [email, enabled]);

  const createBookingData = useCallback(
    async (data: CreateBookingData): Promise<Booking> => {
      if (!email) {
        throw new Error('Email is required to create booking');
      }

      setIsCreating(true);
      setError(null);

      try {
        const newBooking = await createBooking(data);
        
        // Update local state optimistically
        setBookings(prev => [...prev, newBooking]);

        // Invalidate cache
        bookingsCache.delete(email);

        return newBooking;
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsCreating(false);
      }
    },
    [email]
  );

  const removeBooking = useCallback(
    async (bookingIdx: number): Promise<void> => {
      setIsDeleting(true);
      setError(null);

      try {
        await deleteBooking(bookingIdx);

        // Update local state optimistically
        setBookings(prev => prev.filter(b => b.idx !== bookingIdx));

        // Invalidate cache
        if (email) {
          bookingsCache.delete(email);
        }
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [email]
  );

  useEffect(() => {
    if (refetchOnMount) {
      fetchBookings();
    }

    return () => {
      // Cleanup: abort pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBookings, refetchOnMount]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    create: createBookingData,
    remove: removeBooking,
    isCreating,
    isDeleting,
  };
}

/**
 * Clear bookings cache (useful after logout or when data might be stale)
 */
export function clearBookingsCache(email?: string): void {
  if (email) {
    bookingsCache.delete(email);
  } else {
    bookingsCache.clear();
  }
}
