'use client';

import { useState } from 'react';
import { FormRenderer } from '@/components/forms';
import { ProfilePictureUpload } from '@/components/portal/settings/components/ProfilePictureUpload';
import { useSession } from '@/hooks/useSession';
import { createPersonalFormConfig } from '@/utils/settings/formConfigs';
import { handlePersonalFormSubmit } from '@/utils/settings/handlers';
import { useSettingsTab } from '@/utils/settings/useSettingsTab';

export default function PersonalSettingsPage() {
  const { refetch: refetchSession, profilePhotoUrl: sessionProfilePhotoUrl } =
    useSession();
  const { formConfig: personalFormConfig, user } = useSettingsTab(
    createPersonalFormConfig,
    async (user, data) => {
      await handlePersonalFormSubmit(user!.email, data, user?.profile);
    }
  );
  // Local state only for optimistic update after upload; otherwise use session's profile photo (cached)
  const [profileImageOverride, setProfileImageOverride] = useState<
    string | undefined
  >(undefined);

  const profileImage = profileImageOverride ?? sessionProfilePhotoUrl ?? undefined;

  return (
    <FormRenderer
      config={personalFormConfig}
      customFirstField={
        <ProfilePictureUpload
          currentImage={profileImage}
          onImageChange={setProfileImageOverride}
          userEmail={user?.email}
          user={user ?? undefined}
          onUploadSuccess={refetchSession}
        />
      }
    />
  );
}
