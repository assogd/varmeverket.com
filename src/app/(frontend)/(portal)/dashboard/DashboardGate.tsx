'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import BackendAPI from '@/lib/backendApi';
import { LoadingState } from '@/components/ui';
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
    return <LoadingState className="min-h-[40vh]" />;
  }

  if (!user?.email) {
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
      userEmail={user.email}
    />
  );
}
