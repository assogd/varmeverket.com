'use client';

import { useState, useMemo } from 'react';
import BackendAPI from '@/lib/backendApi';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { Heading } from '@/components/headings';
import { type Booking } from '@/components/ui';
import { useNotification } from '@/hooks/useNotification';
import { PlusIcon } from '@/components/icons';
import { AnnouncementsList } from '@/components/portal/dashboard/AnnouncementsList';
import { CalendarList } from '@/components/portal/dashboard/CalendarList';
import type { Announcement } from '@/lib/announcements';
import {
  bookingsToCalendarItems,
  groupCalendarItemsByDay,
} from '@/lib/calendar';

const INITIAL_BOOKINGS_VISIBLE = 10;
const LOAD_MORE_STEP = 10;

interface DashboardClientProps {
  announcements: Announcement[];
  bookings: Booking[];
  userEmail: string;
}

export function DashboardClient({
  announcements,
  bookings: initialBookings,
  userEmail,
}: DashboardClientProps) {
  const { showError } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || []);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BOOKINGS_VISIBLE);

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
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await BackendAPI.getBookings(userEmail);
      setBookings(data as unknown as Booking[]);
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
    <PageLayout contentType="page">
      <PageHeaderTextOnly
        text={{
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'DASHBOARD',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'heading',
                tag: 'h1',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        }}
      />
      {/* Announcements Section */}
      {announcements.length > 0 && (
        <SectionFrame
          title={
            <Heading variant="section" as="h2" center>
              Meddelanden
            </Heading>
          }
        >
          <AnnouncementsList announcements={announcements} />
        </SectionFrame>
      )}

      {/* Calendar Section */}
      <SectionFrame
        title={
          <Heading variant="section" as="h2" center>
            Kalender
          </Heading>
        }
        description="Här kan du se dina kommande bokningar och sparade events. Evenemang markerade med en ⭐ visar våra publika events du kan delta i."
      >
        {bookingsLoading ? (
          <p className="text-text/70 dark:text-dark-text/70">
            Laddar bokningar...
          </p>
        ) : bookingsError ? (
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400">{bookingsError}</p>
            <button
              onClick={handleRetryBookings}
              className="px-4 py-2 bg-text text-bg rounded hover:bg-text/90 transition-colors text-sm"
            >
              Försök igen
            </button>
          </div>
        ) : (
          <>
            <CalendarList dayGroups={dayGroups} />
            {hasMore && (
              <div className="mt-14 text-center font-mono">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex items-center justify-center gap-2 uppercase [&>span]:underline"
                >
                  <PlusIcon size={10} className="flex-shrink-0 no-underline" />
                  <span>Ladda fler bokningar</span>
                </button>
              </div>
            )}
          </>
        )}
      </SectionFrame>
    </PageLayout>
  );
}
