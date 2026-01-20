'use client';

import { useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createBusinessFormConfig } from '@/utils/settings/formConfigs';
import { handleBusinessFormSubmit } from '@/utils/settings/handlers';
import { BusinessTab } from '@/components/portal/settings/components/TabContent';

export default function BusinessSettingsPage() {
  const { user } = useSession();

  // Form submission handler
  const handleBusinessSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handleBusinessFormSubmit(user.email, data);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  // Form configuration
  const businessFormConfig: FormConfig = useMemo(
    () => createBusinessFormConfig(user, handleBusinessSubmit),
    [user, handleBusinessSubmit]
  );

  return <BusinessTab formConfig={businessFormConfig} />;
}
