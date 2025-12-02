'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LogoutButton from '@/components/auth/LogoutButton';
import BackendAPI from '@/lib/backendApi';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useSession();
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setBookingsLoading(true);
      BackendAPI.getBookings(user.email)
        .then(data => {
          setBookings(data);
        })
        .catch(error => {
          console.error('Failed to fetch bookings:', error);
        })
        .finally(() => {
          setBookingsLoading(false);
        });
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <LogoutButton />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              <div className="bg-surface p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                {user && (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    {user.roles && (
                      <p>
                        <strong>Roles:</strong> {user.roles.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-surface p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
                {bookingsLoading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    No bookings yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((booking: any) => (
                      <div
                        key={booking.idx}
                        className="p-4 border border-gray-300 rounded"
                      >
                        <p>
                          <strong>{booking.space}</strong>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(booking.start).toLocaleString()} -{' '}
                          {new Date(booking.end).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

