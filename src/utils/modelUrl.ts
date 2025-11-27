/**
 * Utility to fix 3D model URLs for S3 CDN
 * 3D models are served directly from S3 CDN at assets.varmeverket.com
 * CORS is enabled, so direct fetching works without a proxy
 */

// S3 CDN domain for assets
const S3_CDN_DOMAIN = 'https://assets.varmeverket.com';

/**
 * Fix model URL to use S3 CDN directly
 * With CORS enabled, these URLs can be fetched directly from the browser
 */
export function fixModelUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If it's already a full URL with the S3 CDN domain, return as is
  if (url.startsWith('http') && url.includes('assets.varmeverket.com')) {
    return url;
  }

  // Extract filename from URL
  let filename = url;
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      filename = urlObj.pathname.split('/').pop() || url;
    } catch {
      filename = url.split('/').pop() || url;
    }
  } else if (url.startsWith('/')) {
    filename = url.split('/').pop() || url;
  }

  return `${S3_CDN_DOMAIN}/${filename}`;
}
