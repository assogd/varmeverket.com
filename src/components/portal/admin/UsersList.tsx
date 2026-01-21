'use client';

import { useState } from 'react';

interface User {
  email: string;
  idx: number;
  name: string;
  username: string;
  roles?: string[];
  created?: string;
  updated?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  gender?: string;
  profileImage?: string;
}

interface EmailStatus {
  email: string;
  user_idx: number;
  verified: string;
  subscribed: number;
  enabled: number;
}

interface UserData {
  user: User | null;
  emailStatus: EmailStatus | null;
  warnings?: {
    userError: string | null;
    emailError: string | null;
  };
}

export function UsersList() {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        // If it's a 404, still set the data to show warnings if available
        if (response.status === 404 && data.warnings) {
          setUserData(data);
          setError(data.message || 'User not found');
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } else {
        setUserData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="userEmail" className="block text-sm font-medium mb-2">
            Search by Email
          </label>
          <div className="flex gap-2">
            <input
              id="userEmail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="user@example.com"
              className="flex-1 px-4 py-2 border border-text/20 dark:border-dark-text/20 rounded bg-bg dark:bg-dark-bg text-text dark:text-dark-text"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
          Loading user data...
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
            Error loading user data
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {userData && (
        <div className="space-y-4">
          {userData.user && (
            <div className="p-6 border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg">
              <h3 className="font-semibold text-lg mb-4">User Data</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {userData.user.email}
                </div>
                <div>
                  <span className="font-medium">Name:</span>{' '}
                  {userData.user.name || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {userData.user.idx}
                </div>
                <div>
                  <span className="font-medium">Username:</span>{' '}
                  {userData.user.username}
                </div>
                {userData.user.roles && (
                  <div>
                    <span className="font-medium">Roles:</span>{' '}
                    {userData.user.roles.join(', ') || 'No roles'}
                  </div>
                )}
                {userData.user.created && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(userData.user.created).toLocaleString()}
                  </div>
                )}
                {userData.user.updated && (
                  <div>
                    <span className="font-medium">Updated:</span>{' '}
                    {new Date(userData.user.updated).toLocaleString()}
                  </div>
                )}
                {userData.user.phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{' '}
                    {userData.user.phone}
                  </div>
                )}
                {userData.user.dateOfBirth && (
                  <div>
                    <span className="font-medium">Date of birth:</span>{' '}
                    {userData.user.dateOfBirth}
                  </div>
                )}
                {userData.user.location && (
                  <div>
                    <span className="font-medium">Location:</span>{' '}
                    {userData.user.location}
                  </div>
                )}
                {userData.user.gender && (
                  <div>
                    <span className="font-medium">Gender:</span>{' '}
                    {userData.user.gender}
                  </div>
                )}
                {userData.user.profileImage && (
                  <div>
                    <span className="font-medium">Profile image:</span>{' '}
                    {userData.user.profileImage}
                  </div>
                )}
              </div>
            </div>
          )}

          {userData.emailStatus && (
            <div className="p-6 border border-text/20 dark:border-dark-text/20 rounded-lg bg-bg dark:bg-dark-bg">
              <h3 className="font-semibold text-lg mb-4">Email Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {userData.emailStatus.email}
                </div>
                <div>
                  <span className="font-medium">User ID:</span>{' '}
                  {userData.emailStatus.user_idx}
                </div>
                <div>
                  <span className="font-medium">Verified:</span>{' '}
                  {userData.emailStatus.verified
                    ? new Date(userData.emailStatus.verified).toLocaleString()
                    : 'Not verified'}
                </div>
                <div>
                  <span className="font-medium">Subscribed:</span>{' '}
                  {userData.emailStatus.subscribed ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Enabled:</span>{' '}
                  {userData.emailStatus.enabled ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Yes (User can log in)
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ✗ No (User cannot log in)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {!userData.user && !userData.emailStatus && (
            <div className="p-8 text-center text-text/70 dark:text-dark-text/70">
              No user data found for this email
            </div>
          )}

          {userData.warnings && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold mb-2">
                Warnings:
              </p>
              {userData.warnings.userError && (
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  User endpoint: {userData.warnings.userError}
                </p>
              )}
              {userData.warnings.emailError && (
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Email endpoint: {userData.warnings.emailError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
