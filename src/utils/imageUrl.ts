/**
 * Utility to fix image URLs for S3 CDN
 * Images are now served directly from S3 CDN at assets.varmeverket.com
 */

// S3 CDN domain for assets
const S3_CDN_DOMAIN = 'https://assets.varmeverket.com';

/**
 * Fix image URL to use S3 CDN
 */
export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If it's already a full URL with the S3 CDN domain, return as is
  if (url.startsWith('http') && url.includes('assets.varmeverket.com')) {
    return url;
  }

  // If it's a full URL with the old Payload domain, convert to S3 CDN
  if (url.startsWith('http') && url.includes('payload.cms.varmeverket.com')) {
    try {
      const urlObj = new URL(url);
      // Extract filename from the old API path
      const filename = urlObj.pathname.replace('/api/media/file/', '');
      return `${S3_CDN_DOMAIN}/${filename}`;
    } catch {
      return url;
    }
  }

  // If it's a full URL with localhost or other domain, try to extract filename
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop();
      if (filename) {
        return `${S3_CDN_DOMAIN}/${filename}`;
      }
    } catch {
      return url;
    }
  }

  // If it's a relative path, extract filename and use S3 CDN
  if (url.startsWith('/')) {
    const filename = url.split('/').pop();
    if (filename) {
      return `${S3_CDN_DOMAIN}/${filename}`;
    }
  }

  // If it's just a filename, use S3 CDN directly
  return `${S3_CDN_DOMAIN}/${url}`;
}

const PROFILE_PHOTO_CACHE_PREFIX = 'profilePhotoUrl:';

/** Get cached profile photo URL for an email (sessionStorage). Returns null if none or in SSR. */
export function getCachedProfilePhotoUrl(email: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(PROFILE_PHOTO_CACHE_PREFIX + email);
  } catch {
    return null;
  }
}

/** Cache profile photo URL for an email (sessionStorage). No-op in SSR. */
export function setCachedProfilePhotoUrl(email: string, url: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PROFILE_PHOTO_CACHE_PREFIX + email, url);
  } catch {
    // ignore quota / private mode
  }
}

/** Clear cached profile photo for an email (e.g. after remove). */
export function clearCachedProfilePhotoUrl(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PROFILE_PHOTO_CACHE_PREFIX + email);
  } catch {
    // ignore
  }
}

/**
 * Build public URL for a profile photo from API file_key (e.g. profile-photos/10564/xxx.jpg).
 * Profile photos are stored in DO Spaces; same CDN as other assets.
 *
 * Resolutions: DO Spaces CDN does not support URL-based resizing. Use next/image with this URL
 * and width/height/sizes so Next.js serves an optimized, resized version (and WebP/AVIF when enabled).
 */
export function profilePhotoUrl(fileKey: string | undefined | null): string {
  if (!fileKey) return '';
  if (fileKey.startsWith('http')) return fileKey;
  return `${S3_CDN_DOMAIN}/${fileKey.replace(/^\//, '')}`;
}

/**
 * Fix video URL to use S3 CDN
 */
export function fixVideoUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If it's already a full URL with the S3 CDN domain, return as is
  if (url.startsWith('http') && url.includes('assets.varmeverket.com')) {
    return url;
  }

  // If it's a full URL with the old Payload domain, convert to S3 CDN
  if (url.startsWith('http') && url.includes('payload.cms.varmeverket.com')) {
    try {
      const urlObj = new URL(url);
      // Extract filename from the old API path
      const filename = urlObj.pathname.replace('/api/media/file/', '');
      return `${S3_CDN_DOMAIN}/${filename}`;
    } catch {
      return url;
    }
  }

  // If it's a full URL with localhost or other domain, try to extract filename
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split('/').pop();
      if (filename) {
        return `${S3_CDN_DOMAIN}/${filename}`;
      }
    } catch {
      return url;
    }
  }

  // If it's a relative path, extract filename and use S3 CDN
  if (url.startsWith('/')) {
    const filename = url.split('/').pop();
    if (filename) {
      return `${S3_CDN_DOMAIN}/${filename}`;
    }
  }

  // If it's just a filename, use S3 CDN directly
  return `${S3_CDN_DOMAIN}/${url}`;
}

/**
 * Fix image object with URL transformation
 */
export function fixImageObject(image: {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}): {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
} {
  if (!image) return image;

  return {
    ...image,
    url: fixImageUrl(image.url),
  };
}
