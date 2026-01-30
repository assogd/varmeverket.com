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

// Re-export block types for convenience
export type {
  FormFieldBlock,
  FormSectionBlock,
  FormContentBlock,
  FieldCondition,
} from './types';

/**
 * Convert a FieldCondition (JSON-serializable) to a showIf function
 * Used for CMS forms where conditions are stored as JSON
 */
export function conditionToShowIf(
  condition: FieldCondition
): (formValues: FormValues) => boolean {
  const { field, value, operator = 'equals' } = condition;
  return (formValues: FormValues) => {
    const fieldValue = formValues[field];
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'contains':
        return (
          typeof fieldValue === 'string' &&
          typeof value === 'string' &&
          fieldValue.includes(value)
        );
      case 'notContains':
        return !(
          typeof fieldValue === 'string' &&
          typeof value === 'string' &&
          fieldValue.includes(value)
        );
      default:
        return fieldValue === value;
    }
  };
}

/**
 * Helper function to create form field blocks easily
 * Maps field types to block types for the new blocks-based system
 */
export const createFieldBlock = (
  name: string,
  label: string,
  fieldType: FormField['fieldType'],
  options?: Partial<FormField>
): FormFieldBlock => {
  // Map field types to block types
  const fieldTypeToBlockType: Record<FormField['fieldType'], string> = {
    text: 'formFieldText',
    textarea: 'formFieldTextarea',
    email: 'formFieldEmail',
    password: 'formFieldText', // Password uses text field for now
    select: 'formFieldSelect',
    checkbox: 'formFieldCheckbox',
    number: 'formFieldNumber',
    state: 'formFieldState',
    country: 'formFieldCountry',
    tel: 'formFieldTel',
    url: 'formFieldUrl',
    date: 'formFieldDate',
    message: 'formFieldMessage',
  };

  const blockType = fieldTypeToBlockType[fieldType] || 'formFieldText';

  return {
    blockType,
    name,
    label,
    required: options?.required ?? false,
    defaultValue: options?.defaultValue,
    placeholder: options?.placeholder,
    helpText: options?.helpText,
    options: options?.options,
    minYear: options?.minYear,
    maxYear: options?.maxYear,
    inputMode: options?.inputMode,
    pattern: options?.pattern,
    maxLength: options?.maxLength,
  };
};

/**
 * Helper function to create form section blocks easily
 */
export const createSectionBlock = (
  title: string,
  fields: FormFieldBlock[]
): FormSectionBlock => ({
  blockType: 'formSection',
  title,
  fields,
});
