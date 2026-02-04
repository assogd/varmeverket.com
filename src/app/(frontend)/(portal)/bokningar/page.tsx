'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { type Booking } from '@/components/ui';
import { useNotification } from '@/hooks/useNotification';
import { PlusIcon } from '@/components/icons';
import BackendAPI from '@/lib/backendApi';
import { CalendarList } from '@/components/portal/dashboard/CalendarList';
import {
  bookingsToCalendarItems,
  groupCalendarItemsByDay,
} from '@/lib/calendar';

const INITIAL_BOOKINGS_VISIBLE = 10;
const LOAD_MORE_STEP = 10;

function CalendarListSkeleton() {
  return (
    <div className="space-y-8 px-2" aria-hidden>
      {[1, 2].map(day => (
        <div key={day} className="space-y-4 pt-4 first:pt-0">
          <div className="h-5 w-32 rounded bg-text/10 dark:bg-dark-text/10 animate-pulse" />
          <div className="space-y-2">
            {[1, 2].map(card => (
              <div key={card} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 h-4 mt-6 rounded bg-text/10 dark:bg-dark-text/10 animate-pulse" />
                <div className="flex-1 min-w-0 rounded-lg border border-text p-5">
                  <div className="h-5 w-3/4 rounded bg-text/10 dark:bg-dark-text/10 animate-pulse mb-3" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded bg-text/10 dark:bg-dark-text/10 animate-pulse" />
                    <div className="h-6 w-14 rounded bg-text/10 dark:bg-dark-text/10 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useSession();
  const { showError } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BOOKINGS_VISIBLE);

  useEffect(() => {
    if (!user?.email) {
      setBookingsLoading(false);
      return;
    }
    let cancelled = false;
    setBookingsLoading(true);
    setBookingsError(null);
    BackendAPI.getBookings(user.email)
      .then((data: unknown) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? (data as unknown as Booking[]) : [];
        setBookings(list);
        setBookingsError(null);
        setVisibleCount(INITIAL_BOOKINGS_VISIBLE);
      })
      .catch(error => {
        if (cancelled) return;
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load bookings. Please try again later.';
        setBookingsError(errorMessage);
        setBookings([]);
        showError(errorMessage);
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // showError is intentionally omitted to avoid refetching when notification context updates
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const allItems = useMemo(() => {
    const items = bookingsToCalendarItems(bookings);
    return [...items].sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
    );
  }, [bookings]);
  const displayedItems = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount]
  );
  const dayGroups = useMemo(
    () => groupCalendarItemsByDay(displayedItems),
    [displayedItems]
  );
  const hasMore = visibleCount < allItems.length;
  const loadMore = () =>
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_STEP, allItems.length));

  const handleRetryBookings = async () => {
    if (!user?.email) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await BackendAPI.getBookings(user.email);
      setBookings((data as unknown as Booking[]) ?? []);
      setBookingsError(null);
      setVisibleCount(INITIAL_BOOKINGS_VISIBLE);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load bookings. Please try again later.';
      setBookingsError(errorMessage);
      showError(errorMessage);
    } finally {
      setBookingsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout contentType="page" className="px-2" paddingBottom={false}>
        <PageHeaderTextOnly title="Bokningar" />
        <SectionFrame>
          {bookingsLoading || !user?.email ? (
            <CalendarListSkeleton />
          ) : bookingsError ? (
            <div className="space-y-4">
              <p className="">{bookingsError}</p>
              <button
                onClick={handleRetryBookings}
                className="inline-flex items-center justify-center gap-2 uppercase underline"
              >
                Försök igen
              </button>
            </div>
          ) : (
            <>
              <CalendarList
                dayGroups={dayGroups}
                emptyStateKnown={!!user?.email && !bookingsLoading}
              />
              {hasMore && (
                <div className="mt-14 text-center font-mono">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="inline-flex items-center justify-center gap-2 uppercase [&>span]:underline"
                  >
                    <PlusIcon
                      size={10}
                      className="flex-shrink-0 no-underline"
                    />
                    <span>Ladda fler bokningar</span>
                  </button>
                </div>
              )}
            </>
          )}
        </SectionFrame>
      </PageLayout>
    </ProtectedRoute>
  );
}
