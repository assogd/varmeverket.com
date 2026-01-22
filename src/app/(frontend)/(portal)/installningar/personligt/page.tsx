'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createPersonalFormConfig } from '@/utils/settings/formConfigs';
import { handlePersonalFormSubmit } from '@/utils/settings/handlers';
import { PersonalTab } from '@/components/portal/settings/components/TabContent';

export default function PersonalSettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [profileImage, setProfileImage] = useState<string | undefined>();

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user?.profileImage]);

  // Form submission handler
  const handlePersonalSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handlePersonalFormSubmit(user.email, data, user?.profile);
        alert('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [user?.email]
  );

  // Form configuration
  const personalFormConfig: FormConfig = useMemo(
    () => createPersonalFormConfig(user, handlePersonalSubmit),
    [user, handlePersonalSubmit]
  );

  if (sessionLoading) {
    return null;
  }

  return (
    <PersonalTab
      formConfig={personalFormConfig}
      profileImage={profileImage}
      onProfileImageChange={setProfileImage}
    />
  );
}
