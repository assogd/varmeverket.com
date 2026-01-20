/**
 * Form field blocks and form section block exports
 * These blocks are used in the Payload CMS form builder
 */

export { default as FormFieldText } from './FormFieldText';
export { default as FormFieldTextarea } from './FormFieldTextarea';
export { default as FormFieldEmail } from './FormFieldEmail';
export { default as FormFieldSelect } from './FormFieldSelect';
export { default as FormFieldCheckbox } from './FormFieldCheckbox';
export { default as FormFieldNumber } from './FormFieldNumber';
export { default as FormFieldState } from './FormFieldState';
export { default as FormFieldCountry } from './FormFieldCountry';
export { default as FormFieldTel } from './FormFieldTel';
export { default as FormFieldUrl } from './FormFieldUrl';
export { default as FormFieldDate } from './FormFieldDate';
export { default as FormFieldMessage } from './FormFieldMessage';
export { default as FormSection } from './FormSection';

// Export all form field blocks as an array for easy use
import FormFieldText from './FormFieldText';
import FormFieldTextarea from './FormFieldTextarea';
import FormFieldEmail from './FormFieldEmail';
import FormFieldSelect from './FormFieldSelect';
import FormFieldCheckbox from './FormFieldCheckbox';
import FormFieldNumber from './FormFieldNumber';
import FormFieldState from './FormFieldState';
import FormFieldCountry from './FormFieldCountry';
import FormFieldTel from './FormFieldTel';
import FormFieldUrl from './FormFieldUrl';
import FormFieldDate from './FormFieldDate';
import FormFieldMessage from './FormFieldMessage';
import FormSection from './FormSection';

export const allFormFieldBlocks = [
  FormFieldText,
  FormFieldTextarea,
  FormFieldEmail,
  FormFieldSelect,
  FormFieldCheckbox,
  FormFieldNumber,
  FormFieldState,
  FormFieldCountry,
  FormFieldTel,
  FormFieldUrl,
  FormFieldDate,
  FormFieldMessage,
];

export const allFormBlocks = [
  ...allFormFieldBlocks,
  FormSection,
];
