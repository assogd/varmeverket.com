'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BackendAPI, { type User } from '@/lib/backendApi';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeaderTextOnly } from '@/components/headers/pages';
import PageLayout from '@/components/layout/PageLayout';

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

  const activateEmail = async (email: string) => {
    try {
      // Use server-side API route to activate email
      // This keeps the API key credentials secure on the server
      const response = await fetch('/api/admin/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailStatus(Array.isArray(data) ? data[0] : data);
        alert('User activated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          `Failed to activate: ${errorData.status_message || response.statusText}`
        );
      }
    } catch (error) {
      console.error('Error activating email:', error);
      alert('Error activating user');
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
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">
                Authentication Error
              </h2>
              <p className="mb-4">{error}</p>
              <div className="mb-4 p-3 bg-white dark:bg-black/20 rounded text-sm">
                <p className="font-semibold mb-2">Debug Info:</p>
                <p className="mb-2">
                  Check the browser console for detailed error information.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  If you have cookies but still see this error, the session
                  might be expired or invalid. Try logging in again.
                </p>
              </div>
              {error.includes('SSL') || error.includes('Network error') ? (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                  <p className="font-semibold mb-1">
                    SSL/Network Issue Detected:
                  </p>
                  <p className="mb-2">
                    You're trying to access the site via HTTPS, but there's no
                    valid SSL certificate for local development.
                  </p>
                  <p className="font-semibold mb-1">Solutions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Use HTTP instead:{' '}
                      <code className="bg-black/10 dark:bg-white/10 px-1 rounded">
                        http://local.addd.varmeverket.com:3000
                      </code>
                    </li>
                    <li>
                      Or configure a valid SSL certificate for local development
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-white dark:bg-black/20 p-4 rounded text-sm">
                  <p className="font-semibold mb-2">Troubleshooting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Check DevTools → Application → Cookies →
                      api.varmeverket.com
                    </li>
                    <li>
                      Verify the backend is setting cookies with correct
                      SameSite settings
                    </li>
                    <li>
                      The backend may need to allow credentials from your
                      frontend domain
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-surface p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Session Info</h2>
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                  <p className="font-semibold mb-1">🔍 Debug Info:</p>
                  <p>
                    Check browser DevTools → Application → Cookies →{' '}
                    <code className="bg-black/10 dark:bg-white/10 px-1 rounded">
                      {BackendAPI.getBaseURL()}
                    </code>
                  </p>
                  <p className="mt-2">
                    The session cookie should be set by the backend when you
                    click the magic link. If no cookie is found, this is a
                    backend configuration issue.
                  </p>
                </div>
                {user ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        ✓ Active session
                      </p>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 mb-2">
                        View session details
                      </summary>
                      <pre className="mt-2 p-3 bg-black/10 dark:bg-white/10 rounded overflow-auto text-xs">
                        {JSON.stringify(session, null, 2)}
                      </pre>
                    </details>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <p>
                        💡 Session is stored in cookies. Check DevTools →
                        Application → Cookies to see the session cookie set by{' '}
                        <code className="bg-black/10 dark:bg-white/10 px-1 rounded">
                          {BackendAPI.getBaseURL()}
                        </code>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No active session
                  </p>
                )}
              </div>

              <div className="bg-surface p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                {userDataLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading profile data...
                  </p>
                ) : fullUserData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Name
                        </p>
                        <p className="text-base">{fullUserData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Email
                        </p>
                        <p className="text-base">{fullUserData.email}</p>
                      </div>
                      {fullUserData.username && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Username (UUID)
                          </p>
                          <p className="text-base font-mono text-sm">
                            {fullUserData.username}
                          </p>
                        </div>
                      )}
                      {fullUserData.idx && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            User ID
                          </p>
                          <p className="text-base">{fullUserData.idx}</p>
                        </div>
                      )}
                      {fullUserData.roles && fullUserData.roles.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Roles
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {fullUserData.roles.map((role, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-accent/10 text-accent rounded text-sm"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {fullUserData.created && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Account Created
                          </p>
                          <p className="text-base">
                            {new Date(fullUserData.created).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {fullUserData.updated && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Last Updated
                          </p>
                          <p className="text-base">
                            {new Date(fullUserData.updated).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {emailStatus && (
                      <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <h3 className="font-semibold mb-2">
                          Email Activation Status
                        </h3>
                        <p className="text-sm mb-2">
                          <strong>Enabled:</strong>{' '}
                          {emailStatus.enabled === 1 ? (
                            <span className="text-green-600 dark:text-green-400">
                              Yes ✓
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              No ✗
                            </span>
                          )}
                        </p>
                        {emailStatus.enabled === 0 && user?.email && (
                          <button
                            onClick={() => activateEmail(user.email)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Activate User
                          </button>
                        )}
                      </div>
                    )}
                    {checkingEmail && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Checking email status...
                      </p>
                    )}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        View raw user data
                      </summary>
                      <pre className="mt-2 p-3 bg-black/10 dark:bg-white/10 rounded overflow-auto text-xs">
                        {JSON.stringify(fullUserData, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : user ? (
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
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No user data available
                  </p>
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
      </PageLayout>
    </ProtectedRoute>
  );
}
