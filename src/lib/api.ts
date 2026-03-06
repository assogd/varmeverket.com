/**
 * API Configuration for External Backend Connection
 *
 * This file handles the connection to the external Payload backend
 * and provides a unified interface for data fetching.
 */

import { monitoredFetch } from '@/utils/cacheMonitor';

const PROD_API_BASE_URL = 'https://payload.cms.varmeverket.com/api';

// In dev with no PAYLOAD_API_URL: try local first, then prod. Otherwise use single URL.
const isDevLocalFirst =
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  !process.env.NEXT_PUBLIC_PAYLOAD_API_URL;

const LOCAL_API_BASE_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'}/api`;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_API_URL ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? LOCAL_API_BASE_URL
    : PROD_API_BASE_URL);

const USE_EXTERNAL_BACKEND = true;

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
  const { validate, ...init } = options;
  const bases = isDevLocalFirst
    ? [LOCAL_API_BASE_URL, PROD_API_BASE_URL]
    : [API_BASE_URL];

  let lastError: Error | null = null;
  let lastData: T | null = null;
  for (const base of bases) {
    try {
      const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
      const response = await monitoredFetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 1800 },
        ...init,
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      if (validate && !validate(data)) {
        lastData = data;
        continue;
      }
      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (SERVER_API_DEBUG && base === bases[0]) {
        console.error(`❌ Payload request failed (trying next base):`, lastError);
      }
    }
  }
  if (lastData !== null) {
    return lastData;
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
      console.error(`❌ Failed to fetch from external API (${collection}):`, error);
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
   * Find a single document by ID
   */
  static async findByID<T>(
    collection: string,
    id: string,
    depth = 10
  ): Promise<T> {
    const path = `/${collection}/${id}?depth=${depth}`;
    return fetchPayloadPath<T>(path, { next: { revalidate: 60 } } as RequestInit);
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
          validate: (d) =>
            Array.isArray((d as { docs?: unknown[] }).docs) &&
            (d as { docs: unknown[] }).docs.length > 0,
        });
        return data.docs[0] ?? null;
      } catch (error) {
        console.error(`❌ Failed to fetch by slug from API (${collection}):`, error);
        throw error;
      }
    });
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
    // Import BackendAPI to use its submitForm method
    // This ensures we use the correct endpoint and authentication
    const { BackendAPI } = await import('./backendApi');
    
    // Backend API expects form data as form-encoded for /v3/forms endpoint
    // But the API_GUIDE shows it can accept JSON too, so we'll use JSON
    // The BackendAPI.submitForm uses /forms/<formId>/submit which might be different
    // Let's check the API_GUIDE - it says POST /v3/forms/<form>
    
    const BACKEND_API_URL =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      process.env.BACKEND_API_URL ||
      'https://api.varmeverket.com';
    
    const url = `${BACKEND_API_URL}/v3/forms/${formId}`;

    try {
      // Convert formData to URL-encoded format as per API_GUIDE example
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
