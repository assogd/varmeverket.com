/**
 * Settings Page Handlers
 * Form submission and data handling logic with optimistic updates
 */

import { updateUser } from '@/services/userService';
import { clearUserCache } from '@/hooks/useUser';
import type { User } from '@/lib/backendApi';

/**
 * Handles submission of personal information form
 * Uses service layer for consistent error handling
 */
export async function handlePersonalFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<User> {
  const updatedUser = await updateUser(userEmail, {
    name: data.name as string,
    email: data.email as string,
    // Extended fields - will be saved when backend API supports them
    phone: data.phone as string,
    dateOfBirth: data.dateOfBirth as string,
    location: data.location as string,
    gender: data.gender as string,
  });

  // Clear cache to ensure fresh data on next fetch
  clearUserCache(userEmail);

  return updatedUser;
}

/**
 * Handles submission of business information form
 * TODO: Implement when backend supports business fields
 */
export async function handleBusinessFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<void> {
  // TODO: Implement business form submission
  console.log('Business form data:', data);
  // Clear cache when implemented
  clearUserCache(userEmail);
}

/**
 * Handles submission of account settings form
 * TODO: Implement when backend supports account fields
 */
export async function handleAccountFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<void> {
  // TODO: Implement account form submission
  console.log('Account form data:', data);
  // Clear cache when implemented
  clearUserCache(userEmail);
}
