'use client';

import { useCallback, useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import { useUser } from '@/hooks/useUser';
import { useNotification } from '@/hooks/useNotification';
import type { FormConfig } from '@/components/forms';
import type { User } from '@/lib/backendApi';

export type SettingsSubmitHandler = (
  user: User | null,
  data: Record<string, unknown>
) => Promise<void>;

/**
 * Shared hook for settings tab pages. Provides session, notifications,
 * a submit handler that shows toasts and rethrows, and a memoized form config.
 * Fetches full user (GET /v2/users/:email) so form configs get profile and other
 * extended fields; session alone may not include them.
 */
export function useSettingsTab(
  createFormConfig: (
    user: User | null,
    onSubmit: (data: Record<string, unknown>) => Promise<void>
  ) => FormConfig,
  submitHandler: SettingsSubmitHandler
) {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const { user: fullUser, loading: userLoading } = useUser({
    email: sessionUser?.email ?? null,
    enabled: !!sessionUser?.email,
  });
  const { showError } = useNotification();

  /** Use full user (with profile, etc.) when loaded so business/personal forms get correct defaults */
  const user = fullUser ?? sessionUser ?? null;
  const loading = sessionLoading || (!!sessionUser?.email && userLoading);

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '95ada4',
      },
      body: JSON.stringify({
        sessionId: '95ada4',
        hypothesisId: 'H4',
        location: 'useSettingsTab.ts',
        message: 'session vs full user and formConfigKey',
        data: {
          sessionEmail: sessionUser?.email ?? null,
          hasSessionProfile: !!(sessionUser as { profile?: unknown })?.profile,
          hasFullUser: !!fullUser,
          hasFullProfile: !!(fullUser as { profile?: unknown })?.profile,
          formConfigKey: fullUser ? `full-${sessionUser?.email ?? ''}` : `session-${sessionUser?.email ?? ''}`,
          sessionLoading,
          userLoading,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      const TIMEOUT_MS = 15000;
      try {
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
          submitHandler(user, data)
            .then(() => {
              clearTimeout(t);
              resolve();
            })
            .catch(err => {
              clearTimeout(t);
              reject(err);
            });
        });
        // Success toast is shown by FormRenderer when showSuccessMessage is true
      } catch (error) {
        console.error('Failed to save settings:', error);
        const message =
          error instanceof Error && error.message === 'timeout'
            ? 'Sparandet tog för lång tid. Kontrollera nätverket och försök igen.'
            : 'Kunde inte spara inställningar. Försök igen.';
        showError(message);
        throw error;
      }
    },
    [user, submitHandler, showError]
  );

  const formConfig = useMemo(
    () => createFormConfig(user, handleSubmit),
    [user, handleSubmit]
  );

  /** Changes when full user loads so form remounts and applies profile/defaults */
  const formConfigKey = fullUser ? `full-${sessionUser?.email ?? ''}` : `session-${sessionUser?.email ?? ''}`;

  return { formConfig, user, loading, formConfigKey };
}
