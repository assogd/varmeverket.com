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
