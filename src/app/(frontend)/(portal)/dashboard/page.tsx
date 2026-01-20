'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackendAPI, {
  type User,
  type Booking as BackendBooking,
} from '@/lib/backendApi';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { BookingsList, type Booking } from '@/components/ui';

export default function DashboardPage() {
  const { user, loading, error } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [fullUserData, setFullUserData] = useState<User | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    email: string;
    user_idx: number;
    verified: string;
    subscribed: number;
    enabled: number;
  } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const searchParams = useSearchParams();

  // Check if we're coming from a magic link redirect
  useEffect(() => {
    const authToken = searchParams.get('auth');
    const token = searchParams.get('token');

    if (authToken || token) {
      console.log('🔵 Detected auth parameters in URL:', { authToken, token });
      console.log('⚠️ Backend should have set a cookie, but none found.');
      console.log('💡 This suggests a backend configuration issue.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.email) {
      // Fetch full user data
      setUserDataLoading(true);
      BackendAPI.getUserByEmail(user.email)
        .then(data => {
          setFullUserData(data);
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error);
          // Fall back to session user data if full fetch fails
          setFullUserData(user);
        })
        .finally(() => {
          setUserDataLoading(false);
        });

      // Fetch bookings
      setBookingsLoading(true);
      setBookingsError(null);
      console.log('🔵 Fetching bookings for:', user.email);
      BackendAPI.getBookings(user.email)
        .then((data: BackendBooking[]) => {
          console.log('✅ Bookings fetched successfully:', {
            count: data.length,
            bookings: data,
          });
          // Convert BackendBooking to BookingsList Booking format
          setBookings(data as unknown as Booking[]);
          setBookingsError(null);

          if (data.length === 0) {
            console.log(
              'ℹ️ No bookings found - this is normal if user has no bookings'
            );
          }
        })
        .catch(error => {
          console.error('Failed to fetch bookings:', error);
          // Log more details about the error
          if (error instanceof Error) {
            console.error('Booking error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
            });
          }
          if (error && typeof error === 'object' && 'status' in error) {
            console.error(
              'Booking API error status:',
              (error as { status: number }).status
            );
          }
          // Set error message for display
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to load bookings. Please try again later.';
          setBookingsError(errorMessage);
          setBookings([]); // Clear bookings on error
        })
        .finally(() => {
          setBookingsLoading(false);
        });

      // Check email activation status (only if API key is available server-side)
      // This endpoint requires admin credentials, so it may fail in frontend
      // We'll handle the error gracefully
      if (user?.email) {
        checkEmailStatus(user.email).catch(() => {
          // Silently fail - this is an admin endpoint that may not be accessible
          console.log('ℹ️ Email status check unavailable (admin endpoint)');
        });
      }
    }
  }, [user]);

  const checkEmailStatus = async (email: string) => {
    setCheckingEmail(true);
    try {
      // Use server-side API route to check email status
      // This keeps the API key credentials secure on the server
      const response = await fetch(
        `/api/admin/check-email?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailStatus(Array.isArray(data) ? data[0] : data);
      } else if (response.status === 401) {
        // 401 is expected - this is an admin endpoint requiring API key
        // Don't log as error, just skip
        console.log(
          'ℹ️ Email status check requires admin credentials (skipped)'
        );
      } else {
        console.error('Failed to check email status:', response.status);
      }
    } catch (error) {
      console.error('Error checking email status:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

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
                      text: 'Dashboard',
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
          {loading ? (
            <p>Loading...</p>
          ) : error &&
            !error.includes('401') &&
            !error.includes('400') &&
            !error.includes('Not authenticated') ? (
            <div>Authentication Error: {error}</div>
          ) : (
            <div className="space-y-6">
              {bookingsError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                    Error loading bookings
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {bookingsError}
                  </p>
                  <button
                    onClick={() => {
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
                          })
                          .finally(() => {
                            setBookingsLoading(false);
                          });
                      }
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
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
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
