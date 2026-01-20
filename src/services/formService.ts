/**
 * Form Service
 * 
 * Centralized service for form submission operations
 * Provides a clean interface for form-related API calls
 */

import PayloadAPI from '@/lib/api';
import { handleAPIError, retryAPI } from '@/utils/apiErrorHandler';

export interface FormSubmissionResponse {
  id: number;
  form: string;
  submission: Record<string, unknown>;
  user_id: number | null;
  created_at: string;
  archived: number;
}

/**
 * Submit a form
 * 
 * All form submissions go to Backend API /v3/forms/<formSlug>
 * This includes both CMS forms (created in Payload) and hardcoded forms.
 * 
 * @param formId - Form slug or name (e.g., "test-11", "contact-form")
 * @param formData - Form data to submit
 * @returns Form submission response
 */
export async function submitForm(
  formId: string,
  formData: Record<string, unknown>
): Promise<FormSubmissionResponse> {
  try {
    return await retryAPI(() => PayloadAPI.submitForm(formId, formData));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to submit form: ${message}`);
  }
}
