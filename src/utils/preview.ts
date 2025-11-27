import { cookies } from 'next/headers';

/**
 * Preview Mode Utilities
 *
 * These utilities help detect and manage preview mode for draft content.
 */

export interface PreviewData {
  isPreview: boolean;
  collection?: string;
  slug?: string;
}

/**
 * Check if the current request is in preview mode
 */
export async function getPreviewData(): Promise<PreviewData> {
  try {
    const cookieStore = await cookies();
    const preview = cookieStore.get('preview')?.value;
    const collection = cookieStore.get('preview-collection')?.value;
    const slug = cookieStore.get('preview-slug')?.value;

    return {
      isPreview: preview === 'true',
      collection: collection || undefined,
      slug: slug || undefined,
    };
  } catch (error) {
    console.error('Error getting preview data:', error);
    return { isPreview: false };
  }
}

/**
 * Check if preview mode is active from search params
 */
export function isPreviewFromSearchParams(
  searchParams: URLSearchParams
): boolean {
  return searchParams.get('preview') === 'true';
}

/**
 * Generate preview URL for a document
 */
export function generatePreviewUrl(
  collection: string,
  slug: string,
  baseUrl: string = ''
): string {
  return `${baseUrl}/${collection}/${slug}?preview=true`;
}

/**
 * Generate preview activation URL for Payload admin
 */
export function generatePreviewActivationUrl(
  collection: string,
  slug: string,
  baseUrl: string = ''
): string {
  const previewSecret = process.env.PREVIEW_SECRET || 'your-preview-secret';
  return `${baseUrl}/api/preview?secret=${previewSecret}&collection=${collection}&slug=${slug}`;
}

/**
 * Exit preview mode
 */
export async function exitPreview(): Promise<void> {
  try {
    await fetch('/api/preview', {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error exiting preview mode:', error);
  }
}
