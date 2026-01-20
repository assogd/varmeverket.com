/**
 * Centralized API Error Handling Utility
 * 
 * Provides consistent error handling patterns across the application
 */

import { BackendAPIError } from '@/lib/backendApi';

export interface ErrorHandlerOptions {
  on401?: () => void; // Handle unauthorized (redirect to login)
  on400?: (message: string) => void; // Handle bad request
  on403?: () => void; // Handle forbidden
  on404?: () => void; // Handle not found
  on500?: (message: string) => void; // Handle server error
  onNetworkError?: (error: Error) => void; // Handle network errors
  onUnknownError?: (error: unknown) => void; // Handle unknown errors
  showToast?: (message: string, type: 'error' | 'warning') => void; // Optional toast notification
}

/**
 * Handle API errors consistently
 * 
 * @param error - The error to handle
 * @param options - Error handling options
 * @returns A user-friendly error message
 */
export function handleAPIError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  const {
    on401,
    on400,
    on403,
    on404,
    on500,
    onNetworkError,
    onUnknownError,
    showToast,
  } = options;

  // Handle BackendAPIError (structured API errors)
  if (error instanceof BackendAPIError) {
    const message = error.message || 'An error occurred';
    const status = error.status;

    switch (status) {
      case 401:
        // Unauthorized - user needs to log in
        if (on401) {
          on401();
        } else {
          // Default: redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return 'Please log in to continue';

      case 400:
        // Bad request - validation error or invalid input
        if (on400) {
          on400(message);
        }
        if (showToast) {
          showToast(message, 'error');
        }
        return message;

      case 403:
        // Forbidden - user doesn't have permission
        if (on403) {
          on403();
        }
        if (showToast) {
          showToast('You do not have permission to perform this action', 'error');
        }
        return 'You do not have permission to perform this action';

      case 404:
        // Not found
        if (on404) {
          on404();
        }
        if (showToast) {
          showToast('The requested resource was not found', 'error');
        }
        return 'The requested resource was not found';

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        if (on500) {
          on500(message);
        }
        if (showToast) {
          showToast('Server error. Please try again later.', 'error');
        }
        return 'Server error. Please try again later.';

      default:
        // Other API errors
        if (showToast) {
          showToast(message, 'error');
        }
        return message;
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const networkError = new Error('Network error: Unable to connect to the server');
    if (onNetworkError) {
      onNetworkError(networkError);
    }
    if (showToast) {
      showToast('Network error. Please check your connection.', 'error');
    }
    return 'Network error. Please check your connection.';
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    if (onUnknownError) {
      onUnknownError(error);
    }
    if (showToast) {
      showToast(error.message, 'error');
    }
    return error.message;
  }

  // Handle unknown errors
  const unknownError = new Error('An unexpected error occurred');
  if (onUnknownError) {
    onUnknownError(unknownError);
  }
  if (showToast) {
    showToast('An unexpected error occurred', 'error');
  }
  return 'An unexpected error occurred';
}

/**
 * Check if an error is an authentication error (401 or 400 with auth message)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof BackendAPIError) {
    return error.status === 401 || error.status === 400;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('401') ||
      error.message.includes('400') ||
      error.message.includes('Not authenticated') ||
      error.message.includes('Unauthorized')
    );
  }
  return false;
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('Network');
  }
  if (error instanceof Error) {
    return (
      error.message.includes('Network error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('SSL')
    );
  }
  return false;
}

/**
 * Retry logic for API calls
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delay - Delay between retries in ms (default: 1000)
 * @returns The result of the function
 */
export async function retryAPI<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry auth errors or client errors (4xx)
      if (error instanceof BackendAPIError) {
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
  }

  throw lastError;
}
