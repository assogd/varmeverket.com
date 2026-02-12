'use client';

import { useCallback, useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
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
 */
export function useSettingsTab(
  createFormConfig: (
    user: User | null,
    onSubmit: (data: Record<string, unknown>) => Promise<void>
  ) => FormConfig,
  submitHandler: SettingsSubmitHandler
) {
  const { user, loading } = useSession();
  const { showError } = useNotification();

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

  return { formConfig, user, loading };
}
