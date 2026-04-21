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
 * Fetches full user (GET /v3/users/:email) so form configs get profile and other
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

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) {
        throw new Error(
          'Saknar användaridentitet. Ladda om sidan och försök igen.'
        );
      }
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
    [createFormConfig, user, handleSubmit]
  );

  /** Stable once user is resolved; avoids remount flash when session vs full user swap */
  const formConfigKey = `settings-${sessionUser?.email ?? 'anon'}`;

  return { formConfig, user, loading, formConfigKey };
}
