/**
 * Profile picture upload via backend presigned URL flow:
 * 1) Create upload intent → 2) PUT file to S3 → 3) Confirm.
 * Images are processed client-side to JPEG (resize, compress) for security and performance.
 * Actions (change / remove) appear in a dropdown on avatar click.
 */

import { useState, useEffect, useRef } from 'react';
import BackendAPI from '@/lib/backendApi';
import { Avatar, DropdownMenu } from '@/components/ui';
import { CloseIcon } from '@/components/icons';
import { profilePhotoUrl } from '@/utils/imageUrl';
import clsx from 'clsx';

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

/** Material Design–style edit (pencil) icon, 24×24 viewBox */
const PencilIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="shrink-0"
    aria-hidden
  >
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange?: (imageUrl: string) => void;
  userEmail?: string;
  user?: { name?: string; email?: string };
  onUploadSuccess?: () => void;
  /** Prioritize loading the avatar image (e.g. on settings page). */
  priority?: boolean;
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
  user,
  onUploadSuccess,
  priority = false,
}: ProfilePictureUploadProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(() => {
    if (!currentImage) return undefined;
    if (currentImage.startsWith('http') || currentImage.startsWith('data:'))
      return currentImage;
    return profilePhotoUrl(currentImage);
  });
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentImage === undefined) {
      setProfileImage(undefined);
      return;
    }
    if (currentImage.startsWith('http') || currentImage.startsWith('data:')) {
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
        await BackendAPI.createProfilePhotoUploadIntent(
          userEmail,
          'image/jpeg'
        );
      const blob = await processImageToJpeg(file);
      const putRes = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
          'x-amz-acl': 'public-read',
        },
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

  const handleRemovePhoto = async () => {
    if (!userEmail || !profileImage) return;
    setError(null);
    setRemoving(true);
    try {
      await BackendAPI.deleteProfilePhoto(userEmail);
      setProfileImage(undefined);
      onImageChange?.('');
      onUploadSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kunde inte ta bort bilden.';
      setError(message);
    } finally {
      setRemoving(false);
    }
  };

  const handleChangePhotoClick = () => {
    if (uploading || !userEmail) return;
    fileInputRef.current?.click();
  };

  const canInteract = Boolean(userEmail) && !uploading && !removing;
  const showPlaceholder = !user && !profileImage;

  return (
    <div className="w-full space-y-4">
      <label className="block w-full">Profilbild</label>
      <div className="flex w-full items-start justify-end place-items-end gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          aria-hidden
        />
        <DropdownMenu.Root
          trigger={
            <div
              className={clsx(
                'group relative block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-text/40',
                !canInteract && 'pointer-events-none'
              )}
              aria-label="Profilbild, klicka för att ändra eller ta bort"
            >
              {showPlaceholder ? (
                <div
                  className="w-12 h-12 shrink-0 rounded-md bg-text/10 dark:bg-dark-text/10 animate-pulse"
                  aria-hidden
                />
              ) : (
                <Avatar
                  user={user}
                  profileImageUrl={profileImage}
                  size="3xl"
                  priority={priority}
                  className="shrink-0"
                />
              )}
              {canInteract && (
                <span
                  className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  <span className="text-white">
                    <PencilIcon size={16} />
                  </span>
                </span>
              )}
            </div>
          }
          placement="right"
          disabled={!canInteract}
          className="shrink-0"
        >
          <DropdownMenu.Item
            icon={<PencilIcon />}
            onSelect={handleChangePhotoClick}
            disabled={!userEmail || uploading}
          >
            {uploading ? 'Laddar upp…' : 'Ändra profilbild'}
          </DropdownMenu.Item>
          {profileImage && (
            <DropdownMenu.Item
              icon={<CloseIcon size={16} />}
              onSelect={handleRemovePhoto}
              disabled={!userEmail || removing}
            >
              {removing ? 'Tar bort…' : 'Ta bort profilbild'}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Root>
        <div className="flex-1 min-w-0">
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
