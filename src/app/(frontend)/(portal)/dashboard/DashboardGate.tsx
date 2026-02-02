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
        if (!cancelled) setBookings((data as unknown) as Booking[]);
      })
      .catch(() => {
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
      <div className="min-h-[40vh] flex items-center justify-center text-text/70">
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
