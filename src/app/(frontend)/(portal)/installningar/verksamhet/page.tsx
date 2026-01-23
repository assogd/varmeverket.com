'use client';

import { useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createBusinessFormConfig } from '@/utils/settings/formConfigs';
import { handleBusinessFormSubmit } from '@/utils/settings/handlers';
import { BusinessTab } from '@/components/portal/settings/components/TabContent';
import { useNotification } from '@/hooks/useNotification';

export default function BusinessSettingsPage() {
  const { user } = useSession();
  const { showSuccess, showError } = useNotification();

  // Form submission handler
  const handleBusinessSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleBusinessFormSubmit(user.email, data);
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
  const businessFormConfig: FormConfig = useMemo(
    () => createBusinessFormConfig(user, handleBusinessSubmit),
    [user, handleBusinessSubmit]
  );

  return <BusinessTab formConfig={businessFormConfig} />;
}
