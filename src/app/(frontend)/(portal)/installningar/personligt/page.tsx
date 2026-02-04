'use client';

import { useState, useEffect } from 'react';
import { FormRenderer } from '@/components/forms';
import { ProfilePictureUpload } from '@/components/portal/settings/components/ProfilePictureUpload';
import { createPersonalFormConfig } from '@/utils/settings/formConfigs';
import { handlePersonalFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

export default function PersonalSettingsPage() {
  const { formConfig: personalFormConfig, user } = useSettingsTab(
    createPersonalFormConfig,
    async (user, data) => {
      await handlePersonalFormSubmit(user!.email, data, user?.profile);
    }
  );
  const [profileImage, setProfileImage] = useState<string | undefined>();

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user?.profileImage]);

  return (
    <FormRenderer
      config={personalFormConfig}
      customFirstField={
        <ProfilePictureUpload
          currentImage={profileImage}
          onImageChange={setProfileImage}
        />
      }
    />
  );
}
