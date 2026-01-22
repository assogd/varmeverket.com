'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import BackendAPI, { type User } from '@/lib/backendApi';
import type { FormConfig } from '@/components/forms';
import { createPersonalFormConfig } from '@/utils/settings/formConfigs';
import { handlePersonalFormSubmit } from '@/utils/settings/handlers';
import { PersonalTab } from '@/components/portal/settings/components/TabContent';

export default function PersonalSettingsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | undefined>();

  // Load user data
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      BackendAPI.getUserByEmail(user.email)
        .then(data => {
          setUserData(data);
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
        })
        .catch(error => {
          console.error('Failed to load user data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  // Form submission handler
  const handlePersonalSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.email) return;
      try {
        await handlePersonalFormSubmit(user.email, data);
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

  if (sessionLoading || loading) {
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
