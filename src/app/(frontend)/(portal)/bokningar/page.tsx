'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { type Booking, RoundButton, LoadingState } from '@/components/ui';
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

export default function BookingsPage() {
  const { user } = useSession();
  const { showError } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BOOKINGS_VISIBLE);
  /** Prevents showing "Inga kommande" before we've actually loaded for this user (avoids Laddar → Inga kommande → Laddar flash). */
  const [hasCompletedLoadForUser, setHasCompletedLoadForUser] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setBookingsLoading(false);
      setHasCompletedLoadForUser(false);
      return;
    }
    let cancelled = false;
    setHasCompletedLoadForUser(false);
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
        if (!cancelled) {
          setHasCompletedLoadForUser(true);
          setBookingsLoading(false);
        }
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
          {bookingsLoading || !user?.email || !hasCompletedLoadForUser ? (
            <LoadingState />
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
        <div className="mb-24 flex flex-col items-center gap-12 text-center">
          <p className="font-sans text-lg">
            Behöver du hantera dina bokningar?
          </p>
          <RoundButton
            href={process.env.NEXT_PUBLIC_SKEDDA_BOOKING_URL ?? '#'}
            spin
            size="18rem"
            className="text-lg"
          >
            Skedda
          </RoundButton>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
