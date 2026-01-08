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

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) => {
  // Admin is available when DATABASE_URI is set (full CMS instance)
  // Admin is disabled when NEXT_PUBLIC_PAYLOAD_API_URL is set AND DATABASE_URI is not set (frontend-only instance)
  const hasDatabase = Boolean(process.env.DATABASE_URI);
  const isFrontendOnly = Boolean(process.env.NEXT_PUBLIC_PAYLOAD_API_URL);

  // Show admin if we have a database connection (CMS instance)
  // Hide admin only if we're frontend-only (no database, but has external API URL)
  if (!hasDatabase && isFrontendOnly) {
    notFound();
  }

  return RootPage({ config, params, searchParams, importMap });
};

export default Page;
