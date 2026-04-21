'use client';

import { useState } from 'react';
import BackendAPI from '@/lib/backendApi';

export default function BackendTestPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean | null;
    message: string;
    details?: unknown;
  }>({
    loading: false,
    success: null,
    message: '',
  });

  const [testEmail, setTestEmail] = useState('user@example.com');
  const [testResult, setTestResult] = useState<unknown>(null);
  const [backendUrl] = useState(BackendAPI.getBaseURL() || 'Not configured');

  const testConnection = async () => {
    setStatus({
      loading: true,
      success: null,
      message: 'Testing connection...',
    });

    try {
      const response = await fetch('/api/backend/test');
      const data = await response.json();

      setStatus({
        loading: false,
        success: data.success,
        message: data.message,
        details: data.details,
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to test connection',
      });
    }
  };

  const testMethod = async (
    methodName: string,
    method: () => Promise<unknown>
  ) => {
    setStatus({
      loading: true,
      success: null,
      message: `Testing ${methodName}...`,
    });
    setTestResult(null);

    try {
      const result = await method();
      setTestResult(result);
      setStatus({
        loading: false,
        success: true,
        message: `${methodName} successful`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        loading: false,
        success: false,
        message: `${methodName} failed: ${errorMessage}`,
        details: error,
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Backend API Connection Test</h1>

        <div className="bg-surface p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <div className="space-y-2">
            <div>
              <strong>Backend URL:</strong>{' '}
              <code className="bg-bg px-2 py-1 rounded">{backendUrl}</code>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Set <code>NEXT_PUBLIC_BACKEND_API_URL</code> or{' '}
              <code>BACKEND_API_URL</code> in your .env file
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Connection Test</h2>
          <button
            onClick={testConnection}
            disabled={status.loading}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.loading ? 'Testing...' : 'Test Connection'}
          </button>

          {status.success !== null && (
            <div
              className={`mt-4 p-4 rounded ${
                status.success
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              <strong>{status.success ? '✓ Success' : '✗ Failed'}</strong>
              <p className="mt-2">{status.message}</p>
              {status.details !== undefined && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-75">
                    Show details
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-black/10 dark:bg-white/10 p-2 rounded">
                    {JSON.stringify(status.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
        <div className="bg-surface p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">API Examples</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Email:
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-bg text-text"
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() =>
                  testMethod('getSession', () => BackendAPI.getSession())
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Get Session
              </button>
              <button
                onClick={() =>
                  testMethod('signOn', () =>
                    BackendAPI.signOn(testEmail, window.location.origin)
                  )
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Sign On (Magic Link)
              </button>
              <button
                onClick={() =>
                  testMethod('getUserByEmail', () =>
                    BackendAPI.getUserByEmail(testEmail)
                  )
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Get User by Email
              </button>
              <button
                onClick={async () => {
                  setStatus({
                    loading: true,
                    success: null,
                    message: 'Testing getSpaces...',
                  });
                  setTestResult(null);
                  try {
                    // Try server-side proxy first (avoids CORS issues)
                    const response = await fetch('/api/backend/spaces');
                    const data = await response.json();
                    if (data.success) {
                      setTestResult(data.data);
                      setStatus({
                        loading: false,
                        success: true,
                        message: 'getSpaces successful (via server proxy)',
                      });
                    } else {
                      throw new Error(data.message || 'Failed to fetch spaces');
                    }
                  } catch {
                    // Fallback to direct client-side call
                    try {
                      const spaces = await BackendAPI.getSpaces();
                      setTestResult(spaces);
                      setStatus({
                        loading: false,
                        success: true,
                        message: 'getSpaces successful (via client)',
                      });
                    } catch (clientError) {
                      const errorMessage =
                        clientError instanceof Error
                          ? clientError.message
                          : 'Unknown error';
                      setStatus({
                        loading: false,
                        success: false,
                        message: `getSpaces failed: ${errorMessage}`,
                        details: clientError,
                      });
                    }
                  }
                }}
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Get Spaces
              </button>
              <button
                onClick={() =>
                  testMethod('getBookings', () =>
                    BackendAPI.getBookings(testEmail)
                  )
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
              >
                Get User Bookings
              </button>
              <button
                onClick={() =>
                  testMethod('getSpaceCalendar', () =>
                    BackendAPI.getSpaceCalendar('studio-t')
                  )
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
              >
                Get Space Calendar
              </button>
              <button
                onClick={() =>
                  testMethod('getMultiSpaceCalendar', () =>
                    BackendAPI.getMultiSpaceCalendar()
                  )
                }
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
              >
                Get Multi-Space Calendar
              </button>
              <button
                onClick={() => testMethod('logout', () => BackendAPI.logout())}
                disabled={status.loading}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>

          {testResult !== null && (
            <div className="mt-4 p-4 bg-bg border border-gray-300 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-surface p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Available Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code>signOn(email, redirect?)</code>
                </li>
                <li>
                  <code>getSession()</code>
                </li>
                <li>
                  <code>logout()</code>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Users</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code>getUserByEmail(email)</code>
                </li>
                <li>
                  <code>updateUser(email, data)</code>
                </li>
                <li>
                  <code>replaceUser(data)</code>
                </li>
                <li>
                  <code>deleteUser(email)</code>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Spaces</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code>getSpaces()</code>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bookings</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code>getBookings(email)</code>
                </li>
                <li>
                  <code>createBooking(data)</code>
                </li>
                <li>
                  <code>deleteBooking(idx)</code>
                </li>
                <li>
                  <code>getSpaceCalendar(space)</code>
                </li>
                <li>
                  <code>getMultiSpaceCalendar()</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
