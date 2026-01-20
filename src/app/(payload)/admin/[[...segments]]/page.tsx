/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '@/app/(payload)/admin/importMap';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

/**
 * Conditional Admin Access
 *
 * Admin UI is only available when:
 * - DATABASE_URI is set (full CMS instance with local database)
 *
 * Admin UI is disabled when:
 * - NEXT_PUBLIC_PAYLOAD_API_URL is set (frontend-only instance pointing to external backend)
 *
 * This allows:
 * - cms.varmeverket.com (with DATABASE_URI) → Admin available
 * - www.varmeverket.com (with NEXT_PUBLIC_PAYLOAD_API_URL) → Admin returns 404
 */

/**
 * Check if admin should be available based on environment variables
 * Admin is available when DATABASE_URI is set (CMS instance)
 * Admin is blocked when NEXT_PUBLIC_PAYLOAD_API_URL is set AND DATABASE_URI is not set (frontend-only)
 */
const shouldShowAdmin = (): boolean => {
  const hasDatabase = Boolean(process.env.DATABASE_URI);
  const isFrontendOnly = Boolean(process.env.NEXT_PUBLIC_PAYLOAD_API_URL);
  return hasDatabase || !isFrontendOnly;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  // If admin is blocked, return simple metadata to avoid Payload config initialization
  // This prevents 500 errors when trying to initialize Payload without DATABASE_URI
  if (!shouldShowAdmin()) {
    return {
      title: 'Not Found',
    };
  }

  // Otherwise, use Payload's metadata generation
  return generatePageMetadata({ config, params, searchParams });
};

const Page = ({ params, searchParams }: Args) => {
  const hasDatabase = Boolean(process.env.DATABASE_URI);
  const isFrontendOnly = Boolean(process.env.NEXT_PUBLIC_PAYLOAD_API_URL);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Admin Access]', {
      hasDatabase,
      isFrontendOnly,
      willShowAdmin: shouldShowAdmin(),
      reason:
        !hasDatabase && isFrontendOnly
          ? 'Frontend-only instance'
          : 'CMS instance or development',
    });
  }

  // Show admin if we have a database connection (CMS instance)
  // Hide admin only if we're frontend-only (no database, but has external API URL)
  if (!shouldShowAdmin()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Admin Access] Blocked: Frontend-only instance detected');
    }
    notFound();
  }

  return RootPage({ config, params, searchParams, importMap });
};

export default Page;
