/**
 * Profile picture upload via backend presigned URL flow:
 * 1) Create upload intent → 2) PUT file to S3 → 3) Confirm.
 * Images are processed client-side to JPEG (resize, compress) for security and performance.
 */

import Image from 'next/image';
import { useState, useEffect } from 'react';
import BackendAPI from '@/lib/backendApi';
import { profilePhotoUrl } from '@/utils/imageUrl';
import clsx from 'clsx';

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange?: (imageUrl: string) => void;
  userEmail?: string;
  onUploadSuccess?: () => void;
}

/**
 * Resize and encode image as JPEG (strips EXIF, controls size). Returns blob.
 */
function processImageToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let width = w;
      let height = h;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        if (w >= h) {
          width = MAX_DIMENSION;
          height = Math.round((h * MAX_DIMENSION) / w);
        } else {
          height = MAX_DIMENSION;
          width = Math.round((w * MAX_DIMENSION) / h);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function ProfilePictureUpload({
  currentImage,
  onImageChange,
  userEmail,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(() => {
    if (!currentImage) return undefined;
    if (currentImage.startsWith('http') || currentImage.startsWith('data:'))
      return currentImage;
    return profilePhotoUrl(currentImage);
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage === undefined) {
      setProfileImage(undefined);
      return;
    }
    if (
      currentImage.startsWith('http') ||
      currentImage.startsWith('data:')
    ) {
      setProfileImage(currentImage);
      return;
    }
    setProfileImage(profilePhotoUrl(currentImage));
  }, [currentImage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userEmail) {
      if (!userEmail) setError('Inloggning krävs för att ladda upp.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { upload_url, file_key } =
        await BackendAPI.createProfilePhotoUploadIntent(userEmail);
      const blob = await processImageToJpeg(file);
      const putRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });
      if (!putRes.ok) {
        throw new Error(
          `Uppladdning misslyckades (${putRes.status}). Om du ser CORS-fel i konsolen måste DO Spaces tillåta denna webbadress.`
        );
      }
      await BackendAPI.confirmProfilePhotoUpload(userEmail, file_key);
      const newUrl = profilePhotoUrl(file_key);
      setProfileImage(newUrl);
      onImageChange?.(newUrl);
      onUploadSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kunde inte ladda upp bilden.';
      setError(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const displayUrl = profileImage;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Profilbild</label>
      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 rounded-lg bg-text/10 dark:bg-dark-text/10 flex items-center justify-center overflow-hidden">
          {displayUrl ? (
            <Image
              src={displayUrl}
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
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            disabled={uploading || !userEmail}
            className="hidden"
          />
          <label
            htmlFor="profile-image"
            className={clsx(
              'inline-block px-4 py-2 border rounded-md transition-colors',
              uploading || !userEmail
                ? 'border-text/20 dark:border-dark-text/20 cursor-not-allowed opacity-60'
                : 'border-text/30 dark:border-dark-text/30 cursor-pointer hover:bg-text/5 dark:hover:bg-dark-text/5'
            )}
          >
            {uploading ? 'Laddar upp…' : 'BYT UT BILD'}
          </label>
          <p className="text-xs text-text/60 dark:text-dark-text/60 mt-2">
            Jpg eller png. Bilden komprimeras och sparas som jpg.
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
