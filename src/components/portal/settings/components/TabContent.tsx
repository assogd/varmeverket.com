/**
 * Tab Content Components
 * Separate components for each settings tab
 */

import { FormRenderer } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface PersonalTabProps {
  formConfig: FormConfig;
  profileImage?: string;
  onProfileImageChange?: (imageDataUrl: string) => void;
}

export function PersonalTab({
  formConfig,
  profileImage,
  onProfileImageChange,
}: PersonalTabProps) {
  return (
    <FormRenderer
      config={formConfig}
      customFirstField={
        <ProfilePictureUpload
          currentImage={profileImage}
          onImageChange={onProfileImageChange}
        />
      }
    />
  );
}

interface BusinessTabProps {
  formConfig: FormConfig;
}

export function BusinessTab({ formConfig }: BusinessTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-medium mb-6">Verksamhet</h2>
      <FormRenderer config={formConfig} />
    </div>
  );
}

interface AccountTabProps {
  formConfig: FormConfig;
}

export function AccountTab({ formConfig }: AccountTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-medium mb-6">Konto</h2>
      <FormRenderer config={formConfig} />
    </div>
  );
}
