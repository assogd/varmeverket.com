/**
 * API Configuration for External Backend Connection
 *
 * This file handles the connection to the external Payload backend
 * and provides a unified interface for data fetching.
 */

import { monitoredFetch } from '@/utils/cacheMonitor';

// Environment configuration - always use external for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://payload.cms.varmeverket.com/api';
const USE_EXTERNAL_BACKEND = true; // Always use external for frontend

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

  // Build query parameters
  const params = new URLSearchParams();

  if (where) {
    params.append('where', JSON.stringify(where));
  }

  // Add draft parameter for preview mode
  if (draft) {
    params.append('draft', 'true');
  }
  if (depth) {
    params.append('depth', depth.toString());
  }
  if (limit) {
    params.append('limit', limit.toString());
  }
  if (page) {
    params.append('page', page.toString());
  }
  if (sort) {
    params.append('sort', sort);
  }

  const url = `${API_BASE_URL}/${collection}?${params.toString()}`;

  try {
    const response = await monitoredFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      next: { revalidate: 1800 }, // Revalidate every 30 minutes
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Response logged for debugging in development

    return data;
  } catch (error) {
    console.error(
      `❌ Failed to fetch from external API (${collection}):`,
      error
    );
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
    const response = await fetch(
      `${API_BASE_URL}/${collection}/${id}?depth=${depth}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
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
      // Use direct fetch with simple query format instead of the broken JSON format
      const params = new URLSearchParams();
      params.append(`where[slug][equals]`, slug);
      params.append('depth', depth.toString());

      // Add draft parameter for preview mode
      if (draft) {
        params.append('draft', 'true');
      }
      params.append('limit', '1');

      const url = `${API_BASE_URL}/${collection}?${params.toString()}`;

      try {
        const response = await monitoredFetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 1800 },
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Response logged for debugging in development

        return data.docs[0] || null;
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

      // Add draft parameter for preview mode
      if (draft) {
        params.append('draft', 'true');
      }

      const url = `${API_BASE_URL}/globals/${global}?${params.toString()}`;

      try {
        const response = await monitoredFetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 1800 },
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data || null;
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
