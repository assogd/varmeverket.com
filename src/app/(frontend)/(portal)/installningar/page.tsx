'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { FormConfig } from '@/components/forms';
import { createPersonalFormConfig } from '@/utils/settings/formConfigs';
import { handlePersonalFormSubmit } from '@/utils/settings/handlers';
import { PersonalTab } from '@/components/portal/settings/components/TabContent';
import { useNotification } from '@/hooks/useNotification';

/**
 * Shows personligt content directly on /installningar
 */
export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { showSuccess, showError } = useNotification();
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
        showSuccess('Inställningar sparade!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        showError('Kunde inte spara inställningar. Försök igen.');
        throw new Error('Kunde inte spara inställningar. Försök igen.');
      }
    },
    [showError, showSuccess, user?.email, user?.profile]
  );

  // Form configuration
  const personalFormConfig: FormConfig = useMemo(
    () => createPersonalFormConfig(user, handlePersonalSubmit),
    [user, handlePersonalSubmit]
  );

  if (sessionLoading) {
    return (
      <div>
        <p className="text-text/70 dark:text-dark-text/70">Laddar...</p>
      </div>
    );
  }

  return (
    <PersonalTab
      formConfig={personalFormConfig}
      profileImage={profileImage}
      onProfileImageChange={setProfileImage}
    />
  );
}
