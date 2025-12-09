/**
 * Form field and configuration types
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'select'
  | 'checkbox'
  | 'number'
  | 'state'
  | 'country'
  | 'message'
  | 'tel'
  | 'url'
  | 'date';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  fieldType: FieldType;
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  width?: number;
  validation?: (value: unknown) => true | string;
  helpText?: string;
  minYear?: number; // For date fields: minimum year
  maxYear?: number; // For date fields: maximum year
}

export interface FormConfig {
  id?: string; // For CMS forms
  title?: string;
  fields: FormField[];
  submitButtonLabel?: string;
  onSubmit?: (data: Record<string, unknown>) => Promise<void> | void;
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  showSuccessMessage?: boolean;
  successMessage?: string;
  className?: string;
}

export interface FormValues {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}
