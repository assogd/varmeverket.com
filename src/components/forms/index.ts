/**
 * Form components and utilities
 */

export { FormRenderer } from './FormRenderer';
export { FormFieldComponent } from './FormField';

// Export individual field components for direct use if needed
export {
  TextField,
  TextareaField,
  EmailField,
  PasswordField,
  TelField,
  UrlField,
  NumberField,
  SelectField,
  CheckboxField,
  StateField,
  CountryField,
  MessageField,
} from './fields';

// Export shared field components
export {
  FieldLabel,
  FieldHelpText,
  FieldError,
  FieldWrapper,
} from './fields/shared';

export type {
  FormConfig,
  FormField,
  FormSection,
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

/**
 * Helper function to create form sections easily
 */
export const createSection = (
  title: string,
  fields: FormField[],
  id?: string
): FormSection => ({
  id,
  title,
  fields,
});
