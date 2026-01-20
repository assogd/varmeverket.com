'use client';

import { useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createAccountFormConfig } from '@/utils/settings/formConfigs';
import { handleAccountFormSubmit } from '@/utils/settings/handlers';
import { AccountTab } from '@/components/portal/settings/components/TabContent';

export default function AccountSettingsPage() {
  const { user } = useSession();

  // Form submission handler
  const handleAccountSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleAccountFormSubmit(user.email, data);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  // Form configuration
  const accountFormConfig: FormConfig = useMemo(
    () => createAccountFormConfig(user, handleAccountSubmit),
    [user, handleAccountSubmit]
  );

  return <AccountTab formConfig={accountFormConfig} />;
}
