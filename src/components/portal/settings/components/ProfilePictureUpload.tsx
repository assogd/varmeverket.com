/**
 * Profile Picture Upload Component
 */

import Image from 'next/image';
import { useState } from 'react';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange?: (imageDataUrl: string) => void;
}

export function ProfilePictureUpload({
  currentImage,
  onImageChange,
}: ProfilePictureUploadProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(
    currentImage
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement image upload to backend
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setProfileImage(imageDataUrl);
        onImageChange?.(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Profilbild</label>
      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 rounded-lg bg-text/10 dark:bg-dark-text/10 flex items-center justify-center overflow-hidden">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-text/5 dark:bg-dark-text/5" />
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            id="profile-image"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="profile-image"
            className="inline-block px-4 py-2 border border-text/30 dark:border-dark-text/30 rounded-md cursor-pointer hover:bg-text/5 dark:hover:bg-dark-text/5 transition-colors"
          >
            BYT UT BILD
          </label>
          <p className="text-xs text-text/60 dark:text-dark-text/60 mt-2">
            Bilden bör vara en jpg eller png.
          </p>
        </div>
      </div>
    </div>
  );
}
