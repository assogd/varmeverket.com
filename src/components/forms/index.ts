/**
 * Form components and utilities
 */

export { FormRenderer } from './FormRenderer';
export { FormFieldComponent } from './FormField';
export type {
  FormConfig,
  FormField,
  FormFieldOption,
  FormValues,
  FormErrors,
  FieldType,
} from './types';

/**
 * Helper function to create form fields easily
 */
export const createField = (
  name: string,
  label: string,
  fieldType: FormField['fieldType'],
  options?: Partial<FormField>
): FormField => ({
  name,
  label,
  fieldType,
  required: false,
  ...options,
});
