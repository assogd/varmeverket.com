import React from 'react';

/**
 * Form field and configuration types
 * 
 * This is the single source of truth for form field types.
 * Used by both hardcoded forms and Payload CMS form builder.
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
}

export interface FormSection {
  id?: string; // Optional ID for CMS sections
  title: string; // Section header/title
  fields: FormField[]; // Fields within this section
}

/**
 * Block-based form structure types
 * Used for the new blocks-based form builder architecture
 */
export interface FormFieldBlock {
  blockType: string; // e.g., 'formFieldText', 'formFieldEmail', etc.
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[]; // For select fields
  minYear?: number; // For date fields
  maxYear?: number; // For date fields
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
  [key: string]: unknown; // Allow additional block-specific properties
}

export interface FormSectionBlock {
  blockType: 'formSection';
  title: string;
  fields?: FormFieldBlock[]; // Nested blocks array
  [key: string]: unknown;
}

export type FormContentBlock = FormFieldBlock | FormSectionBlock;

export interface FormConfig {
  id?: string; // For CMS forms
  title?: string;
  // Support multiple structures for backward compatibility and flexibility
  content?: FormContentBlock[]; // New blocks-based structure
  fields?: FormField[]; // Flat array of fields (deprecated, use sections or content)
  sections?: FormSection[]; // Array of sections, each containing fields (deprecated, use content)
  submitButtonLabel?: string;
  submitButtonVariant?: 'marquee' | 'solid';
  /** When using sections: optional title for the separate submit section (e.g. "Har du fyllt i alla uppgifter?") */
  submitSectionTitle?: string;
  /** Optional className for the submit button (e.g. text color to match page bg on orange theme) */
  submitButtonClassName?: string;
  /** Marquee submit button size: default (2.333em) or lg (2.5em) */
  submitButtonSize?: 'default' | 'lg';
  onSubmit?: (data: Record<string, unknown>) => Promise<void> | void;
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  showSuccessMessage?: boolean;
  successMessage?: string;
  className?: string;
  customFirstField?: React.ReactNode; // Custom component to inject as first field in first section
}

export interface FormValues {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}
