'use client';

import { useState } from 'react';

interface Booking {
  idx: number;
  email?: string;
  space: string;
  start: string;
  end: string;
  created?: string;
  updated?: string;
}

export function BookingsList() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        throw new Error('Please enter an email address to search for bookings');
      }

      const url = `/api/admin/bookings?email=${encodeURIComponent(
        trimmedEmail
      )}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <>
              <label
                htmlFor="bookingEmail"
                className="block text-sm font-medium mb-2"
              >
                User Email
              </label>
              <input
                id="bookingEmail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-text/20 dark:border-dark-text/20 rounded bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
              />
            </>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
          Loading bookings...
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
            Error loading bookings
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-text/70 dark:text-dark-text/70">
            Found {bookings.length} booking(s)
          </div>
          <div className="space-y-4">
            {bookings.map(booking => (
              <div
                key={booking.idx}
                className="p-6 border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Booking #{booking.idx}
                    </h3>
                    <div className="text-sm text-text/70 dark:text-dark-text/70 space-y-1">
                      {booking.email && (
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          {booking.email}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Space:</span> {booking.space}
                      </div>
                      <div>
                        <span className="font-medium">Start:</span>{' '}
                        {new Date(booking.start).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">End:</span>{' '}
                        {new Date(booking.end).toLocaleString()}
                      </div>
                      {booking.created && (
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(booking.created).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && email && (
        <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
          No bookings found
        </div>
      )}
    </div>
  );
}
