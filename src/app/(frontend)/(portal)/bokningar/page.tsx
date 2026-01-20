'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { BookingsList, type Booking } from '@/components/ui';
import BackendAPI, { type Booking as BackendBooking } from '@/lib/backendApi';
import { useState, useEffect } from 'react';

export default function BookingsPage() {
  const { user } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setBookingsLoading(true);
      setBookingsError(null);
      BackendAPI.getBookings(user.email)
        .then((data: BackendBooking[]) => {
          setBookings(data as unknown as Booking[]);
          setBookingsError(null);
        })
        .catch(error => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to load bookings. Please try again later.';
          setBookingsError(errorMessage);
          setBookings([]);
        })
        .finally(() => {
          setBookingsLoading(false);
        });
    }
  }, [user]);

  return (
    <ProtectedRoute>
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
                      text: 'Bokningar',
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
        <div className="max-w-4xl mx-auto px-8 pb-8">
          {bookingsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                Error loading bookings
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {bookingsError}
              </p>
            </div>
          ) : (
            <BookingsList
              bookings={bookings}
              loading={bookingsLoading}
              title="My Bookings"
              emptyMessage="No bookings yet."
            />
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
