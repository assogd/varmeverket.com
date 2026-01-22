/**
 * User Service
 * 
 * Centralized service for user data operations
 * Provides a clean interface for user-related API calls
 */

import BackendAPI, { type User } from '@/lib/backendApi';
import { handleAPIError, retryAPI } from '@/utils/apiErrorHandler';

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  address_street?: string;
  address_code?: number;
  address_city?: string;
  profile?: Record<string, unknown> | null;
  profileImage?: string;
}

/**
 * Get user by email
 * 
 * @param email - User email address
 * @returns User data
 */
export async function getUserByEmail(email: string): Promise<User> {
  try {
    return await retryAPI(() => BackendAPI.getUserByEmail(email));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to fetch user: ${message}`);
  }
}

/**
 * Update user data
 * 
 * @param email - User email address
 * @param data - User data to update
 * @returns Updated user data
 */
export async function updateUser(
  email: string,
  data: UpdateUserData
): Promise<User> {
  try {
    return await retryAPI(() => BackendAPI.updateUser(email, data));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to update user: ${message}`);
  }
}

/**
 * Get email activation status
 * 
 * @param email - User email address
 * @returns Email status (verified, enabled, etc.)
 */
export async function getEmailStatus(email: string): Promise<{
  email: string;
  user_idx: number;
  verified: string;
  subscribed: number;
  enabled: number;
}> {
  try {
    return await retryAPI(() => BackendAPI.getEmailStatus(email));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to fetch email status: ${message}`);
  }
}
