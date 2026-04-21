'use client';

import { FormRenderer } from '@/components/forms';
import { LoadingState } from '@/components/ui';
import { createBusinessFormConfig } from '@/utils/settings/formConfigs';
import { handleBusinessFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

export default function BusinessSettingsPage() {
  const {
    formConfig: businessFormConfig,
    formConfigKey,
    loading,
  } = useSettingsTab(createBusinessFormConfig, async (user, data) => {
    await handleBusinessFormSubmit(user!.email, data);
  });

  if (loading) {
    return <LoadingState message="Laddar dina uppgifter…" />;
  }

  return <FormRenderer key={formConfigKey} config={businessFormConfig} />;
}
