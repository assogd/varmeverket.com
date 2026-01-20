/**
 * Settings Page Handlers
 * Form submission and data handling logic
 */

import BackendAPI, { type User } from '@/lib/backendApi';

/**
 * Handles submission of personal information form
 */
export async function handlePersonalFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<void> {
  await BackendAPI.updateUser(userEmail, {
    name: data.name as string,
    email: data.email as string,
    // Extended fields - will be saved when backend API supports them
    phone: data.phone as string,
    dateOfBirth: data.dateOfBirth as string,
    location: data.location as string,
    gender: data.gender as string,
  });
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
}
