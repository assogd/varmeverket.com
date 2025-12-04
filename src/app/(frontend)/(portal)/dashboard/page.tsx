'use client';

import { useSession } from '@/hooks/useSession';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LogoutButton from '@/components/auth/LogoutButton';
import BackendAPI from '@/lib/backendApi';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const { user, session, loading, error } = useSession();
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
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
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
              <p className="mb-4">{error}</p>
              <div className="bg-white dark:bg-black/20 p-4 rounded text-sm">
                <p className="font-semibold mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check DevTools → Application → Cookies → api.varmeverket.com</li>
                  <li>Verify the backend is setting cookies with correct SameSite settings</li>
                  <li>The backend may need to allow credentials from your frontend domain</li>
                </ul>
              </div>
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
                    The session cookie should be set by the backend when you click
                    the magic link. If no cookie is found, this is a backend
                    configuration issue.
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
                        💡 Session is stored in cookies. Check DevTools → Application → Cookies
                        to see the session cookie set by{' '}
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
