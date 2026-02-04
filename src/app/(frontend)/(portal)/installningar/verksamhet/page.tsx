'use client';

import { FormRenderer } from '@/components/forms';
import { createBusinessFormConfig } from '@/utils/settings/formConfigs';
import { handleBusinessFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

export default function BusinessSettingsPage() {
  const { formConfig: businessFormConfig } = useSettingsTab(
    createBusinessFormConfig,
    (user, data) => handleBusinessFormSubmit(user!.email, data)
  );

  return <FormRenderer config={businessFormConfig} />;
}
