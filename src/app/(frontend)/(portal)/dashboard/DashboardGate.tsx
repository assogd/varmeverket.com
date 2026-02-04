'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import BackendAPI from '@/lib/backendApi';
import { DashboardClient } from './DashboardClient';
import type { Announcement } from '@/lib/announcements';
import type { Booking } from '@/components/ui';

interface DashboardGateProps {
  announcements: Announcement[];
}

export function DashboardGate({ announcements }: DashboardGateProps) {
  const { user, loading } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    setBookingsLoading(true);
    BackendAPI.getBookings(user.email)
      .then(data => {
        if (!cancelled) setBookings(data as unknown as Booking[]);
      })
      .catch(err => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7245/ingest/f7f14da6-8371-465e-9a52-bf7ad8a2ae59',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'DashboardGate.tsx:getBookings:catch',
              message: 'Bookings fetch failed',
              data: {
                message: err instanceof Error ? err.message : String(err),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'E',
            }),
          }
        ).catch(() => {});
        // #endregion
        if (!cancelled) setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });
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
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        Laddar...
      </div>
    );
  }

  if (!user?.email) {
    return null;
  }

  if (bookingsLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-text/70">
        Laddar bokningar...
      </div>
    );
  }

  return (
    <DashboardClient
      announcements={announcements}
      bookings={bookings}
      userEmail={user.email}
    />
  );
}
