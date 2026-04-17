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
  initialAnnouncements?: Announcement[];
  initialUserEmail?: string | null;
}

const DASHBOARD_DEBUG = process.env.NEXT_PUBLIC_DASHBOARD_DEBUG === 'true';

export function DashboardGate({
  initialAnnouncements = [],
  initialUserEmail = null,
}: DashboardGateProps) {
  const { user, loading } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const json = await response.json().catch(() => []);
        if (cancelled) return;
        setAnnouncements(Array.isArray(json) ? (json as Announcement[]) : []);
      } catch {
        if (!cancelled) setAnnouncements([]);
      }
    };

    loadAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const effectiveEmail = user?.email ?? initialUserEmail;
    if (!effectiveEmail) return;

    let cancelled = false;
    const startedAt = performance.now();
    setBookingsLoading(true);
    setEventsLoading(true);

    const loadDashboardData = async () => {
      try {
        const [bookingsData, featuredRes, savedRes] = await Promise.all([
          BackendAPI.getBookings(effectiveEmail),
          fetch('/api/portal/featured-events'),
          fetch(`/api/portal/saved-events?email=${encodeURIComponent(effectiveEmail)}`),
        ]);

        if (cancelled) return;

        setBookings(bookingsData as unknown as Booking[]);

        const [featuredJson, savedJson] = await Promise.all([
          featuredRes.json().catch(() => ({})),
          savedRes.json().catch(() => ({})),
        ]);

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
          if (DASHBOARD_DEBUG) {
            const elapsedMs = Math.round(performance.now() - startedAt);
            console.info(`[dashboard] data-ready ${elapsedMs}ms`);
          }
          setBookingsLoading(false);
          setEventsLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [initialUserEmail, user?.email]);

  useEffect(() => {
    if (loading && !initialUserEmail) return;
    if (!user && !initialUserEmail) {
      router.replace('/login');
    }
  }, [initialUserEmail, loading, user, router]);

  if (loading && !initialUserEmail) {
    return <LoadingState className="min-h-[40vh]" />;
  }

  const effectiveEmail = user?.email ?? initialUserEmail;
  if (!effectiveEmail) {
    return null;
  }

  if (bookingsLoading) {
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
      userEmail={effectiveEmail}
    />
  );
}
