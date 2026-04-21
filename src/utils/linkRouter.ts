/**
 * Global Link Router Utility
 *
 * Centralized logic for handling different types of links across the application:
 * - Internal links with Payload references
 * - External links
 * - Copy actions
 */

import { buildEventUrl } from '@/utils/eventUrl';

export interface LinkGroup {
  type: 'internal' | 'external' | 'copy';
  doc?: unknown; // Payload reference object
  reference?: unknown; // Legacy/internal naming used in some callers
  url?: string;
  text?: string;
}

export interface LinkRouterResult {
  href?: string;
  isExternal: boolean;
  isCopy: boolean;
  shouldRenderAsButton: boolean;
}

/**
 * Resolves a Payload reference object to a URL path
 */
function resolveReference(reference: unknown): string | undefined {
  if (!reference) return undefined;

  const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : null;

  // Handle Payload's reference structure: { relationTo: "pages", value: {...} }
  const payloadRef = asRecord(reference);
  const payloadValue = asRecord(payloadRef?.value);
  const payloadSlug =
    typeof payloadValue?.slug === 'string' ? payloadValue.slug : null;
  const payloadCollection =
    typeof payloadRef?.relationTo === 'string' ? payloadRef.relationTo : null;

  if (payloadRef && payloadValue && payloadSlug) {
    const collection = payloadCollection;
    const slug = payloadSlug;

    switch (collection) {
      case 'spaces':
        return `/spaces/${slug}`;
      case 'articles':
        return `/artikel/${slug}`;
      case 'events':
        return buildEventUrl({
          slug,
          startDateTime:
            typeof payloadValue.startDateTime === 'string'
              ? payloadValue.startDateTime
              : undefined,
          parentSlug:
            typeof payloadValue.parentSlug === 'string'
              ? payloadValue.parentSlug
              : undefined,
          href:
            typeof payloadValue.href === 'string'
              ? payloadValue.href
              : undefined,
        });
      case 'pages':
      default:
        // Always redirect homepage to root
        return slug === 'hem' ? '/' : `/${slug}`;
    }
  }

  // Handle direct object structure: { slug: "...", collection: "..." }
  const directRef = asRecord(reference);
  const directSlug =
    typeof directRef?.slug === 'string' ? directRef.slug : null;
  const directCollection =
    typeof directRef?.collection === 'string' ? directRef.collection : null;

  if (directRef && directSlug && !('relationTo' in directRef)) {
    const slug = directSlug;
    const collection = directCollection;

    switch (collection) {
      case 'spaces':
        return `/spaces/${slug}`;
      case 'articles':
        return `/artikel/${slug}`;
      case 'events':
        return buildEventUrl({
          slug,
          startDateTime:
            typeof directRef.startDateTime === 'string'
              ? directRef.startDateTime
              : undefined,
          parentSlug:
            typeof directRef.parentSlug === 'string'
              ? directRef.parentSlug
              : undefined,
          href: typeof directRef.href === 'string' ? directRef.href : undefined,
        });
      case 'pages':
      default:
        // Always redirect homepage to root
        return slug === 'hem' ? '/' : `/${slug}`;
    }
  }

  // If reference is just an ID string
  if (typeof reference === 'string') {
    return `/${reference}`;
  }

  // Fallback for unpopulated references or invalid objects
  return undefined;
}

/**
 * Main link router function that processes LinkGroup objects
 */
export function routeLink(link: LinkGroup): LinkRouterResult {
  const result: LinkRouterResult = {
    href: undefined,
    isExternal: false,
    isCopy: false,
    shouldRenderAsButton: false,
  };

  switch (link.type) {
    case 'external':
      result.href = link.url || '#';
      result.isExternal = true;
      break;

    case 'internal':
      const resolvedHref = resolveReference(link.doc ?? link.reference);
      result.href = resolvedHref || '#';
      result.isExternal = false;
      break;

    case 'copy':
      result.href = link.text || '';
      result.isCopy = true;
      result.shouldRenderAsButton = true;
      break;

    default:
      result.href = '#';
  }

  // Ensure href is always a string
  if (typeof result.href !== 'string') {
    result.href = '#';
  }

  return result;
}

/**
 * Legacy function for backward compatibility
 * Handles the old pattern where components pass individual parameters
 */
export function routeLegacyLink(
  type: 'internal' | 'external' | 'copy',
  reference?: unknown,
  url?: string,
  text?: string
): LinkRouterResult {
  return routeLink({
    type,
    reference,
    url,
    text,
  });
}

/**
 * Utility to check if a URL is external
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http') || url.startsWith('//');
}

/**
 * Utility to get the appropriate target and rel attributes for external links
 */
export function getExternalLinkAttributes() {
  return {
    target: '_blank' as const,
    rel: 'noopener noreferrer' as const,
  };
}

/**
 * Check if a string is an email address
 */
export function isEmailAddress(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
