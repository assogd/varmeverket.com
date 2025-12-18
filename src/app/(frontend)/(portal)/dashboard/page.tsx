'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackendAPI, { type User } from '@/lib/backendApi';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';
import { BookingsList } from '@/components/ui';

export default function DashboardPage() {
  const { user, session, loading, error } = useSession();
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
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
      BackendAPI.getBookings(user.email)
        .then(data => {
          setBookings(data);
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
            console.error('Booking API error status:', (error as any).status);
          }
        })
        .finally(() => {
          setBookingsLoading(false);
        });

      // Check email activation status
      if (user?.email) {
        checkEmailStatus(user.email);
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
              <BookingsList
                bookings={bookings}
                loading={bookingsLoading}
                title="My Bookings"
                emptyMessage="No bookings yet."
              />
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
