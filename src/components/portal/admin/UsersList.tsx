'use client';

import { useState } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface BackendReport {
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  responseBody?: string;
  requestedEmail?: string;
}

interface User {
  email: string;
  idx: number;
  name: string;
  username: string;
  roles?: string[];
  created?: string;
  updated?: string;
  phone?: string;
  birthdate?: string;
  address_street?: string;
  address_code?: number;
  address_city?: string;
  profile?: Record<string, unknown> | null;
  profileImage?: string;
}

interface EmailStatus {
  email: string;
  user_idx: number;
  verified: string;
  subscribed: number;
  enabled: number;
}

interface SubscriptionItem {
  product_name: string;
}

interface Subscription {
  id: string | null;
  status: string;
  items: SubscriptionItem[];
}

interface UserData {
  user: User | null;
  emailStatus: EmailStatus | null;
  subscription?: Subscription[] | null;
  subscriptionError?: string | null;
  warnings?: {
    userError: string | null;
    emailError: string | null;
  };
}

export function UsersList() {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendReport, setBackendReport] = useState<BackendReport | null>(null);
  const { showError, showWarning, showSuccess } = useNotification();

  const handleSearch = async () => {
    if (!email.trim()) {
      showError('Please enter an email address');
      return;
    }

    setLoading(true);
    setBackendReport(null);

    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.backendReport) {
          setBackendReport(data.backendReport);
        }
        // If it's a 404, still set the data to show warnings if available
        if (response.status === 404 && data.warnings) {
          setUserData(data);
          showWarning(data.message || 'User not found');
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } else {
        setUserData(data);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Unknown error');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const copyReportToClipboard = () => {
    if (!backendReport) return;
    const report = `## Backend 403 report

- **Endpoint:** ${backendReport.endpoint}
- **Method:** ${backendReport.method}
- **Status:** ${backendReport.status} ${backendReport.statusText}
- **Requested email:** ${backendReport.requestedEmail ?? '(none)'}
- **Time (UTC):** ${new Date().toISOString()}

### Response body
\`\`\`
${backendReport.responseBody ?? '(empty)'}
\`\`\`
`;
    void navigator.clipboard.writeText(report).then(() => {
      showSuccess('Report copied to clipboard. Paste into your backend issue.');
    });
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

      {backendReport && (
        <div className="p-6 border border-amber-500/30 dark:border-amber-400/30 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Backend report (for bug report)
          </h3>
          <dl className="text-sm space-y-1 mb-4 font-mono">
            <div>
              <span className="text-amber-700 dark:text-amber-300">Endpoint:</span>{' '}
              {backendReport.endpoint}
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-300">Method:</span>{' '}
              {backendReport.method}
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-300">Status:</span>{' '}
              {backendReport.status} {backendReport.statusText}
            </div>
            {backendReport.requestedEmail && (
              <div>
                <span className="text-amber-700 dark:text-amber-300">Requested email:</span>{' '}
                {backendReport.requestedEmail}
              </div>
            )}
            {backendReport.responseBody != null && backendReport.responseBody !== '' && (
              <div className="mt-2">
                <span className="text-amber-700 dark:text-amber-300">Response body:</span>
                <pre className="mt-1 p-2 bg-black/5 dark:bg-white/5 rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {backendReport.responseBody}
                </pre>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={copyReportToClipboard}
            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Copy for report
          </button>
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
                {userData.subscription != null && userData.subscription.length > 0 && userData.subscription[0].items?.[0] && (
                  <div>
                    <span className="font-medium">Stripe level / Medlemskap:</span>{' '}
                    {userData.subscription[0].items[0].product_name}
                  </div>
                )}
                {userData.subscriptionError && (
                  <div>
                    <span className="font-medium">Stripe level:</span>{' '}
                    <span className="text-amber-600 dark:text-amber-400">
                      {userData.subscriptionError}
                    </span>
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
                {userData.user.birthdate && (
                  <div>
                    <span className="font-medium">Birthdate:</span>{' '}
                    {userData.user.birthdate}
                  </div>
                )}
                {userData.user.address_street && (
                  <div>
                    <span className="font-medium">Address street:</span>{' '}
                    {userData.user.address_street}
                  </div>
                )}
                {userData.user.address_code !== undefined &&
                  userData.user.address_code !== null && (
                  <div>
                    <span className="font-medium">Address code:</span>{' '}
                    {userData.user.address_code}
                  </div>
                )}
                {userData.user.address_city && (
                  <div>
                    <span className="font-medium">Address city:</span>{' '}
                    {userData.user.address_city}
                  </div>
                )}
                {userData.user.profile && (
                  <div>
                    <span className="font-medium">Profile:</span>{' '}
                    <span className="break-all">
                      {JSON.stringify(userData.user.profile)}
                    </span>
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

        </div>
      )}
    </div>
  );
}
