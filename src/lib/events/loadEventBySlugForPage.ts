import { PayloadAPI } from '@/lib/api';
import { fetchServerSession } from '@/lib/serverSession';

export type EventAccess = 'public' | 'members_only';

export interface EventForPage {
  id: string;
  slug: string;
  title?: string;
  status?: string;
  eventAccess?: EventAccess | string | null;
  startDateTime?: string;
  endDateTime?: string;
  featuredImage?: { url: string; alt?: string; width?: number; height?: number } | null;
  form?: unknown;
  children?: Array<{
    id: string;
    slug: string;
    title?: string;
    status?: string;
    startDateTime?: string;
    endDateTime?: string;
    eventAccess?: EventAccess | string | null;
    form?: unknown;
  }>;
  // Allow other fields used by the page header/content.
  [key: string]: unknown;
}

export async function loadEventBySlugForPage<T extends EventForPage>(params: {
  slug: string;
  cookieHeader?: string;
  depth?: number;
}): Promise<{ event: T | null; isPortalLoggedIn: boolean }> {
  const { slug, cookieHeader, depth = 10 } = params;

  // Portal membership is based on backend session cookies (api.varmeverket.com),
  // not on Payload CMS auth.
  const session = await fetchServerSession(cookieHeader);
  const isPortalLoggedIn = Boolean(session);

  let event = (await PayloadAPI.findBySlugFresh<T>(
    'events',
    slug,
    depth,
    false
  )) as T | null;

  if (!event && process.env.NODE_ENV === 'development') {
    event = (await PayloadAPI.findBySlugFresh<T>('events', slug, depth, true)) as
      | T
      | null;
  }

  if (!event) return { event: null, isPortalLoggedIn };

  // Keep existing production publication guard.
  if (process.env.NODE_ENV === 'production' && event.status !== 'published') {
    return { event: null, isPortalLoggedIn };
  }

  // Enforce portal access for members-only events.
  const access = (event.eventAccess ?? 'public') as EventAccess;
  if (access === 'members_only' && !isPortalLoggedIn) {
    return { event: null, isPortalLoggedIn };
  }

  return { event, isPortalLoggedIn };
}

