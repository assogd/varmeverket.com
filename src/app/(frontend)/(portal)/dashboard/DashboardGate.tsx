'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import BackendAPI from '@/lib/backendApi';
import { LoadingState } from '@/components/ui';
import { DashboardClient } from './DashboardClient';
import type { Announcement } from '@/lib/announcements';
import type { Booking } from '@/components/ui';
import type { CalendarEvent } from '@/lib/calendar';

interface DashboardGateProps {
  announcements: Announcement[];
}

export function DashboardGate({ announcements }: DashboardGateProps) {
  const { user, loading } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    setBookingsLoading(true);
    setEventsLoading(true);

    const loadDashboardData = async () => {
      try {
        const [bookingsData, featuredRes, savedRes] = await Promise.all([
          BackendAPI.getBookings(user.email),
          fetch('/api/portal/featured-events'),
          fetch(`/api/portal/saved-events?email=${encodeURIComponent(user.email)}`),
        ]);

        if (cancelled) return;

        setBookings(bookingsData as unknown as Booking[]);

        const featuredJson = await featuredRes.json().catch(() => ({}));
        const savedJson = await savedRes.json().catch(() => ({}));

        setFeaturedEvents(
          Array.isArray((featuredJson as { events?: unknown[] }).events)
            ? ((featuredJson as { events?: CalendarEvent[] }).events as CalendarEvent[])
            : []
        );

        setSavedEvents(
          Array.isArray((savedJson as { events?: unknown[] }).events)
            ? ((savedJson as { events?: CalendarEvent[] }).events as CalendarEvent[])
            : []
        );
      } catch {
        if (cancelled) return;
        setBookings([]);
        setFeaturedEvents([]);
        setSavedEvents([]);
      } finally {
        if (!cancelled) {
          setBookingsLoading(false);
          setEventsLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingState className="min-h-[40vh]" />;
  }

  if (!user?.email) {
    return null;
  }

  if (bookingsLoading || eventsLoading) {
    return (
      <LoadingState
        message="Laddar bokningar..."
        className="min-h-[40vh]"
      />
    );
  }

  return (
    <DashboardClient
      announcements={announcements}
      bookings={bookings}
      featuredEvents={featuredEvents}
      savedEvents={savedEvents}
      userEmail={user.email}
    />
  );
}
