'use client';

import { useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createAccountFormConfig } from '@/utils/settings/formConfigs';
import { handleAccountFormSubmit } from '@/utils/settings/handlers';
import { AccountTab } from '@/components/portal/settings/components/TabContent';
import { useNotification } from '@/hooks/useNotification';

export default function AccountSettingsPage() {
  const { user } = useSession();
  const { showSuccess, showError } = useNotification();

  // Form submission handler
  const handleAccountSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleAccountFormSubmit(user.email, data);
        showSuccess('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        showError('Kunde inte spara inställningar. Försök igen.');
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [showError, showSuccess, user?.email]
  );

  // Form configuration
  const accountFormConfig: FormConfig = useMemo(
    () => createAccountFormConfig(user, handleAccountSubmit),
    [user, handleAccountSubmit]
  );

  return <AccountTab formConfig={accountFormConfig} user={user} />;
}
