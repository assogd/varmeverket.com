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
  const { showSuccess, showError } = useNotification();

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await submitHandler(user, data);
        showSuccess('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        showError('Kunde inte spara inställningar. Försök igen.');
        throw error;
      }
    },
    [user, submitHandler, showSuccess, showError]
  );

  const formConfig = useMemo(
    () => createFormConfig(user, handleSubmit),
    [user, handleSubmit]
  );

  return { formConfig, user, loading };
}
