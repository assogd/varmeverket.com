/**
 * API Configuration for External Backend Connection
 *
 * This file handles the connection to the external Payload backend
 * and provides a unified interface for data fetching.
 */

import { monitoredFetch } from '@/utils/cacheMonitor';

const PROD_API_BASE_URL = 'https://payload.cms.varmeverket.com/api';

/** Dev/staging CMS (admin at https://dev.varmeverket.com/admin) — use for announcements, forms, etc. */
const DEV_API_BASE_URL = 'https://dev.varmeverket.com/api';

// In dev with no PAYLOAD_API_URL: use dev CMS first, then prod fallback (no local Payload).
const isDevRemoteCmsFirst =
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  !process.env.NEXT_PUBLIC_PAYLOAD_API_URL;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_API_URL ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? DEV_API_BASE_URL
    : PROD_API_BASE_URL);

const USE_EXTERNAL_BACKEND =
  process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND !== 'false';

// Reduce noisy external API logs in dev; enable only when explicitly debugging.
const SERVER_API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === 'true';

// API response types
interface ApiResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface FindOptions {
  collection: string;
  where?: Record<string, unknown>;
  depth?: number;
  limit?: number;
  page?: number;
  sort?: string;
  draft?: boolean; // Add draft support
}

/** In dev with local-first: try local Payload, then prod. Otherwise single URL. */
async function fetchPayloadPath<T>(
  path: string,
  options: RequestInit & {
    validate?: (data: unknown) => boolean;
  } = {}
): Promise<T> {
  const { next: incomingNext, ...init } = options;
  const bases = isDevRemoteCmsFirst
    ? [DEV_API_BASE_URL, PROD_API_BASE_URL]
    : [API_BASE_URL];

  let lastError: Error | null = null;
  for (const base of bases) {
    try {
      const url = path.startsWith('http')
        ? path
        : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
      const normalizedNext =
        incomingNext && typeof incomingNext.revalidate === 'number'
          ? { revalidate: incomingNext.revalidate }
          : undefined;
      const response = await monitoredFetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...init,
        ...(normalizedNext ? { next: normalizedNext } : {}),
      });
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }
      const data = (await response.json()) as T;
      // Successful 200 is the answer — return it even when validate fails (e.g. empty docs),
      // so the caller gets the empty result instead of falling back to the next base and hitting 404.
      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (SERVER_API_DEBUG && base === bases[0]) {
        console.error(
          `❌ Payload request failed (trying next base):`,
          lastError
        );
      }
    }
  }
  throw lastError ?? new Error('Payload request failed');
}

/**
 * Fetch data from external Payload API
 */
async function fetchFromExternalAPI<T>(
  options: FindOptions
): Promise<ApiResponse<T>> {
  const {
    collection,
    where,
    depth = 2,
    limit = 10,
    page = 1,
    sort,
    draft = false,
  } = options;

  const params = new URLSearchParams();
  if (where) params.append('where', JSON.stringify(where));
  if (draft) params.append('draft', 'true');
  params.append('depth', depth.toString());
  params.append('limit', limit.toString());
  params.append('page', page.toString());
  if (sort) params.append('sort', sort);

  const path = `/${collection}?${params.toString()}`;
  try {
    return await fetchPayloadPath<ApiResponse<T>>(path);
  } catch (error) {
    if (SERVER_API_DEBUG) {
      console.error(
        `❌ Failed to fetch from external API (${collection}):`,
        error
      );
    }
    throw error;
  }
}

/**
 * Fetch data from external Payload API without cache (fresh).
 */
async function fetchFromExternalAPIFresh<T>(
  options: FindOptions
): Promise<ApiResponse<T>> {
  const {
    collection,
    where,
    depth = 2,
    limit = 10,
    page = 1,
    sort,
    draft = false,
  } = options;

  const params = new URLSearchParams();
  if (where) params.append('where', JSON.stringify(where));
  if (draft) params.append('draft', 'true');
  params.append('depth', depth.toString());
  params.append('limit', limit.toString());
  params.append('page', page.toString());
  if (sort) params.append('sort', sort);

  const path = `/${collection}?${params.toString()}`;
  try {
    return await fetchPayloadPath<ApiResponse<T>>(path, {
      next: { revalidate: 0 },
      cache: 'no-store',
    } as RequestInit);
  } catch (error) {
    if (SERVER_API_DEBUG) {
      console.error(
        `❌ Failed to fetch fresh from external API (${collection}):`,
        error
      );
    }
    throw error;
  }
}

// Request deduplication cache
const requestCache = new Map<string, Promise<unknown>>();

/**
 * Unified API interface that works with both local and external backends
 */
export class PayloadAPI {
  /**
   * Helper method for request deduplication
   */
  private static async deduplicatedRequest<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey) as Promise<T>;
    }

    const promise = fetcher();
    requestCache.set(cacheKey, promise);

    try {
      const result = await promise;
      requestCache.delete(cacheKey);
      return result;
    } catch (error) {
      requestCache.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Find documents in a collection
   */
  static async find<T>(options: FindOptions): Promise<ApiResponse<T>> {
    const cacheKey = `find-${JSON.stringify(options)}`;

    return this.deduplicatedRequest(cacheKey, async () => {
      if (USE_EXTERNAL_BACKEND) {
        return fetchFromExternalAPI<T>(options);
      } else {
        // Use local API endpoint (same as external, but local)
        return fetchFromExternalAPI<T>(options);
      }
    });
  }

  /**
   * Find documents in a collection without cross-request cache/dedupe.
   */
  static async findFresh<T>(options: FindOptions): Promise<ApiResponse<T>> {
    if (USE_EXTERNAL_BACKEND) {
      return fetchFromExternalAPIFresh<T>(options);
    }
    return fetchFromExternalAPIFresh<T>(options);
  }

  /**
   * Find a single document by ID
   */
  static async findByID<T>(
    collection: string,
    id: string,
    depth = 10
  ): Promise<T> {
    const path = `/${collection}/${id}?depth=${depth}`;
    return fetchPayloadPath<T>(path, {
      next: { revalidate: 60 },
    } as RequestInit);
  }

  /**
   * Find a single document by ID without cross-request caching.
   * Useful for pages that gate rendering based on a per-request session.
   */
  static async findByIDFresh<T>(
    collection: string,
    id: string,
    depth = 10
  ): Promise<T> {
    const path = `/${collection}/${id}?depth=${depth}`;
    return fetchPayloadPath<T>(path, {
      next: { revalidate: 0 },
      cache: 'no-store',
    } as RequestInit);
  }

  /**
   * Find documents by slug
   */
  static async findBySlug<T>(
    collection: string,
    slug: string,
    depth = 10,
    draft = false
  ): Promise<T | null> {
    const cacheKey = `findBySlug-${collection}-${slug}-${depth}-${draft}`;

    return this.deduplicatedRequest(cacheKey, async () => {
      const params = new URLSearchParams();
      params.append(`where[slug][equals]`, slug);
      params.append('depth', depth.toString());
      if (draft) params.append('draft', 'true');
      params.append('limit', '1');

      const path = `/${collection}?${params.toString()}`;
      try {
        const data = await fetchPayloadPath<{ docs: T[] }>(path, {
          validate: (d: unknown) =>
            Array.isArray((d as { docs?: unknown[] }).docs) &&
            (d as { docs: unknown[] }).docs.length > 0,
        });
        return data.docs[0] ?? null;
      } catch (error) {
        console.error(
          `❌ Failed to fetch by slug from API (${collection}):`,
          error
        );
        throw error;
      }
    });
  }

  /**
   * Find by slug without Next fetch cache or dedupe — use when embedded fields
   * (e.g. article.form) are missing due to stale cached JSON while other fields updated.
   */
  static async findBySlugFresh<T>(
    collection: string,
    slug: string,
    depth = 10,
    draft = false
  ): Promise<T | null> {
    const params = new URLSearchParams();
    params.append(`where[slug][equals]`, slug);
    params.append('depth', depth.toString());
    if (draft) params.append('draft', 'true');
    params.append('limit', '1');
    const path = `/${collection}?${params.toString()}`;
    try {
      const data = await fetchPayloadPath<{ docs: T[] }>(path, {
        validate: (d: unknown) =>
          Array.isArray((d as { docs?: unknown[] }).docs) &&
          (d as { docs: unknown[] }).docs.length > 0,
        next: { revalidate: 0 },
        cache: 'no-store',
      } as RequestInit);
      return data.docs[0] ?? null;
    } catch (error) {
      console.error(`❌ Failed to fetch by slug fresh (${collection}):`, error);
      throw error;
    }
  }

  /**
   * Submit a form
   *
   * Note: Form submissions go to Backend API (/v3/forms/<formSlug>), not Payload CMS.
   * This ensures all form submissions are stored in the backend database and can be
   * linked to users if an email field exists.
   *
   * @param formId - Form slug or name (e.g., "test-11", "contact-form")
   * @param formData - Form data to submit
   * @returns Submission response with id, form, submission data, etc.
   */
  static async submitForm(
    formId: string,
    formData: Record<string, unknown>
  ): Promise<{
    id: number;
    form: string;
    submission: Record<string, unknown>;
    user_id: number | null;
    created_at: string;
    archived: number;
    status_history?: Array<{
      id: number;
      submission_id: number;
      status: string;
      note: string | null;
      created_at: string;
    }>;
  }> {
    // Backend API expects form data on /v3/forms/<form> as url-encoded payload.

    const BACKEND_API_URL =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      process.env.BACKEND_API_URL ||
      'https://api.varmeverket.com';

    const url = `${BACKEND_API_URL}/v3/forms/${formId}`;

    try {
      // Convert formData to URL-encoded format per backend contract.
      const formBody = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formBody.append(key, String(value));
      });
      const bodyStr = formBody.toString();

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Include cookies for authenticated requests
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyStr,
      });

      if (!response.ok) {
        const rawText = await response.text();
        let errorData: { message?: string } = {};
        try {
          errorData = JSON.parse(rawText) as { message?: string };
        } catch {
          errorData = {};
        }
        throw new Error(
          errorData.message ||
            `Form submission failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(`❌ Failed to submit form (${formId}):`, error);
      throw error;
    }
  }

  /**
   * Get a global configuration
   */
  static async getGlobal<T>(
    global: string,
    depth = 2,
    draft = false
  ): Promise<T | null> {
    const cacheKey = `getGlobal-${global}-${depth}-${draft}`;

    return this.deduplicatedRequest(cacheKey, async () => {
      const params = new URLSearchParams();
      params.append('depth', depth.toString());
      if (draft) params.append('draft', 'true');
      const path = `/globals/${global}?${params.toString()}`;
      try {
        const data = await fetchPayloadPath<T>(path);
        return data ?? null;
      } catch (error) {
        console.error(`❌ Failed to fetch global (${global}):`, error);
        throw error;
      }
    });
  }
}

// Export the API class and configuration
export { API_BASE_URL, USE_EXTERNAL_BACKEND };
export default PayloadAPI;
