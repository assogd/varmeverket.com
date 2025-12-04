/**
 * Backend API Client
 *
 * This file handles the connection to the external backend API
 * (varmeverket-api) for portal operations like authentication,
 * form submissions, and settings management.
 */

// Environment configuration
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com'; // Default backend API URL

/**
 * User data structure from API
 */
export interface User {
  created?: string;
  email: string;
  idx: number;
  name: string;
  password?: string; // Hashed password (not always present)
  session?: string; // UUID (not always present)
  updated?: string;
  username: string; // UUID
  roles?: string[]; // e.g., ["member"]
}

/**
 * Session data structure from API
 */
export interface Session {
  _fresh: boolean;
  _id: string;
  csrf_token: string;
  lang: string;
}

/**
 * Session response with user
 */
export interface SessionResponse {
  session: Session;
  user: User;
}

/**
 * Space data structure from API
 */
export interface Space {
  area: string | null;
  capacity: number;
  created_at: string;
  description: string | null;
  m2: number;
  name: string;
  slug: string;
  status: number;
}

/**
 * Booking data structure (v2 - user's own bookings)
 */
export interface Booking {
  created: string;
  email: string;
  end: string;
  idx: number;
  space: string;
  start: string;
  updated: string;
}

/**
 * Public booking data structure (v3 - calendar view, no personal data)
 */
export interface PublicBooking {
  end: string;
  idx: number;
  space: string;
  start: string;
}

/**
 * Sign-on response
 */
export interface SignOnResponse {
  message: string;
  status_code: number;
  status_message: string;
}

/**
 * Generic API error class
 */
export class BackendAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'BackendAPIError';
  }
}

/**
 * Backend API Client
 */
export class BackendAPI {
  /**
   * Get the base URL for the backend API
   */
  static getBaseURL(): string {
    return BACKEND_API_URL;
  }

  /**
   * Generic fetch method with error handling
   */
  private static async fetch<T>(
    endpoint: string,
    options: RequestInit & { requireAuth?: boolean } = {}
  ): Promise<T> {
    const url = `${BACKEND_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const { requireAuth = true, ...fetchOptions } = options;

    // Only add Content-Type for requests with a body (POST, PUT, PATCH)
    const hasBody = fetchOptions.body !== undefined;
    const defaultHeaders: Record<string, string> = {};
    if (hasBody) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      console.log(`🔵 Backend API request: ${url}`, {
        method: fetchOptions.method || 'GET',
        credentials: requireAuth ? 'include' : 'omit',
        hasBody,
      });

      const response = await fetch(url, {
        ...fetchOptions,
        credentials: requireAuth ? 'include' : 'omit', // Only include cookies if auth is required
        headers: {
          ...defaultHeaders,
          ...(fetchOptions.headers as Record<string, string>),
        },
      });

      // Log response headers to see if Set-Cookie is present
      const setCookieHeader = response.headers.get('Set-Cookie');
      console.log(`🔵 Backend API response: ${url}`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        hasSetCookie: !!setCookieHeader,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`❌ Backend API error (${endpoint}):`, {
          status: response.status,
          data,
        });
        throw new BackendAPIError(
          data.message || `API request failed: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof BackendAPIError) {
        throw error;
      }

      console.error(`❌ Backend API request failed (${endpoint}):`, error);
      throw new BackendAPIError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }

  /**
   * Authentication is handled via cookies (credentials: 'include')
   * No token management needed - cookies are handled automatically by the browser
   */

  /**
   * Test connection to backend API
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: unknown;
  }> {
    try {
      // Try a simple GET request to test connectivity
      // The /v2/users endpoint might require auth or specific params, so we'll handle various responses
      await this.fetch('/v2/users', {
        method: 'GET',
      });
      return {
        success: true,
        message: 'Connection successful - API is reachable',
      };
    } catch (error) {
      if (error instanceof BackendAPIError) {
        // 400 might mean the endpoint requires specific parameters or format
        if (error.status === 400) {
          return {
            success: true,
            message:
              'Connection successful - API is reachable (endpoint requires parameters or authentication)',
            details: error.response,
          };
        }
        // 401/403 means API is reachable but requires auth (connection works!)
        if (error.status === 401 || error.status === 403) {
          return {
            success: true,
            message:
              'Connection successful - API is reachable (authentication required)',
          };
        }
        // 404 might mean endpoint doesn't exist, but connection works
        if (error.status === 404) {
          return {
            success: true,
            message: 'Connection successful - API is reachable',
          };
        }
        return {
          success: false,
          message: `Connection failed: ${error.message} (Status: ${error.status})`,
          details: error.response,
        };
      }
      return {
        success: false,
        message: 'Connection failed: Unknown error',
      };
    }
  }

  /**
   * Sign on (initiate login/registration via magic link)
   * POST /session/sign-on?redirect={redirect}
   * Sends a magic link to the email address
   * @param email - User email address
   * @param redirect - Full URL to redirect to after sign-on (e.g., "http://local.addd.varmeverket.com:3000/dashboard")
   */
  static async signOn(
    email: string,
    redirect: string
  ): Promise<SignOnResponse> {
    // Ensure redirect is a full URL (API guide requires this)
    const redirectUrl =
      redirect.startsWith('http://') || redirect.startsWith('https://')
        ? redirect
        : `${
            typeof window !== 'undefined' ? window.location.origin : ''
          }${redirect.startsWith('/') ? redirect : `/${redirect}`}`;

    // Use server-side proxy when running in browser to avoid CORS issues
    const isClient = typeof window !== 'undefined';

    if (isClient) {
      // Use Next.js API route proxy to avoid CORS
      const proxyUrl = `/api/backend/sign-on`;

      console.log('🔵 signOn request (via proxy):', {
        email,
        redirect: redirectUrl,
        proxyUrl,
      });

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, redirect: redirectUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new BackendAPIError(
          data.message || `Sign-on request failed: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data as SignOnResponse;
    }

    // Server-side: call backend API directly
    const endpoint = `/session/sign-on?redirect=${encodeURIComponent(redirectUrl)}`;

    console.log('🔵 signOn request (direct):', {
      email,
      redirect: redirectUrl,
      endpoint,
    });

    return this.fetch<SignOnResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Check active session
   * GET /session
   * Returns session + user if logged in, 401 if not
   */
  static async getSession(): Promise<SessionResponse> {
    // Always call backend API directly with credentials: 'include'
    // This ensures cookies for api.varmeverket.com are sent
    // Backend should have CORS configured to allow requests from our frontend domain
    const isClient = typeof window !== 'undefined';

    if (isClient) {
      // Call backend API directly - cookies will be sent automatically
      // Backend must have CORS configured to allow this
      const url = `${BACKEND_API_URL}/session`;

      console.log('🔵 getSession - calling backend directly:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // This ensures cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 or 400 can mean not logged in
        if (response.status === 401 || response.status === 400) {
          throw new BackendAPIError('Not authenticated', 401, data);
        }
        throw new BackendAPIError(
          data.message || `Session check failed: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data as SessionResponse;
    }

    // Server-side: call backend API directly
    return this.fetch<SessionResponse>('/session');
  }

  /**
   * Get user by email
   * GET /v2/users/:email
   */
  static async getUserByEmail(email: string): Promise<User> {
    return this.fetch<User>(`/v2/users/${email}`);
  }

  /**
   * Update user (partial)
   * PATCH /v2/users/:email
   * Body may include: name, password, username, email (if changing address)
   */
  static async updateUser(
    email: string,
    data: {
      name?: string;
      password?: string;
      username?: string;
      email?: string; // New email if changing address
    }
  ): Promise<User> {
    return this.fetch<User>(`/v2/users/${email}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Replace user data
   * PUT /v2/users
   */
  static async replaceUser(data: {
    email: string;
    name: string;
    password: string;
    username?: string;
  }): Promise<User> {
    return this.fetch<User>('/v2/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user
   * DELETE /v2/users/:email
   * Important: All bookings tied to this user must be deleted first
   */
  static async deleteUser(email: string): Promise<void> {
    await this.fetch(`/v2/users/${email}`, {
      method: 'DELETE',
    });
  }

  /**
   * Logout user
   * GET /session/logout
   * Clears the current session
   */
  static async logout(): Promise<void> {
    try {
      await this.fetch('/session/logout', {
        method: 'GET',
      });
    } catch (error) {
      // Continue even if logout fails
      console.warn('Logout request failed:', error);
    }
  }

  /**
   * Get user's bookings
   * GET /v2/bookings?email={userEmail}
   */
  static async getBookings(email: string): Promise<Booking[]> {
    return this.fetch<Booking[]>(
      `/v2/bookings?email=${encodeURIComponent(email)}`
    );
  }

  /**
   * Create booking
   * POST /v2/bookings
   * Body: { email, space, start, end }
   */
  static async createBooking(data: {
    email: string;
    space: string;
    start: string; // Format: "2024-11-04 17:00"
    end: string; // Format: "2024-11-04 17:30"
  }): Promise<Booking> {
    return this.fetch<Booking>('/v2/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete booking
   * DELETE /v2/bookings/:idx
   */
  static async deleteBooking(bookingIdx: number): Promise<void> {
    await this.fetch(`/v2/bookings/${bookingIdx}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get public calendar for a space (v3 - no personal data)
   * GET /v3/bookings?space={spaceSlugOrName}
   * Returns bookings in 7-day batches for the given space
   * Public endpoint - credentials may be omitted
   */
  static async getSpaceCalendar(space: string): Promise<PublicBooking[]> {
    return this.fetch<PublicBooking[]>(
      `/v3/bookings?space=${encodeURIComponent(space)}`,
      {
        requireAuth: false,
        method: 'GET',
      }
    );
  }

  /**
   * Get multi-space calendar (v3 - no personal data)
   * GET /v3/bookings
   * Returns bookings for multiple spaces (omitting space parameter)
   * Ideal for resource calendar showing many rooms in parallel
   * Public endpoint - credentials may be omitted
   */
  static async getMultiSpaceCalendar(): Promise<PublicBooking[]> {
    return this.fetch<PublicBooking[]>('/v3/bookings', {
      requireAuth: false,
      method: 'GET',
    });
  }

  /**
   * Submit a form
   */
  static async submitForm(
    formId: string,
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    return this.fetch(`/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a list of spaces
   * GET /v2/spaces
   * Public endpoint - credentials may be omitted
   */
  static async getSpaces(): Promise<Space[]> {
    // For GET requests, don't send Content-Type header (not needed for GET)
    const url = `${BACKEND_API_URL}/v2/spaces`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new BackendAPIError(
        data.message || `API request failed: ${response.statusText}`,
        response.status,
        data
      );
    }

    return response.json();
  }

  /**
   * Get settings
   */
  static async getSettings(): Promise<Record<string, unknown>> {
    return this.fetch('/settings');
  }

  /**
   * Update settings
   */
  static async updateSettings(
    settings: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.fetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Export the API class and configuration
export { BACKEND_API_URL };
export default BackendAPI;
