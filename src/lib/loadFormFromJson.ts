/**
 * Load form configurations from JSON files in src/content/forms/.
 * Used for repo-editable forms (portal settings, membership application).
 * Payload CMS forms are separate and managed in the admin.
 */

import type { FormConfig, FormContentBlock, FormFieldBlock, FormSectionBlock } from '@/components/forms/types';
import type { FieldCondition } from '@/components/forms/types';
import personalJson from '@/content/forms/personal.json';
import businessJson from '@/content/forms/business.json';
import accountJson from '@/content/forms/account.json';
import medlemskapJson from '@/content/forms/medlemskap.json';

// JSON form shape (editable in repo)
export interface JsonFormSection {
  title: string;
  fields: JsonFormField[];
}

export interface JsonFormField {
  name: string;
  label: string;
  fieldType: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
  validation?: string; // preset name, e.g. "swedishPostcode"
  pattern?: string;
  maxLength?: number;
  inputMode?: string;
  minYear?: number;
  maxYear?: number;
  conditionalField?: FieldCondition;
}

export interface JsonFormConfig {
  submitButtonLabel?: string;
  successMessage?: string;
  showSuccessMessage?: boolean;
  submitButtonVariant?: 'marquee' | 'solid';
  submitSectionTitle?: string;
  submitButtonClassName?: string;
  submitButtonSize?: 'default' | 'lg';
  sections: JsonFormSection[];
}

const FIELD_TYPE_TO_BLOCK_TYPE: Record<string, string> = {
  text: 'formFieldText',
  textarea: 'formFieldTextarea',
  email: 'formFieldEmail',
  password: 'formFieldText',
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

const VALIDATION_PRESETS: Record<string, (value: unknown) => true | string> = {
  swedishPostcode: (value: unknown) => {
    if (value === undefined || value === null || value === '') return true;
    const normalized = String(value).replace(/\s+/g, '');
    if (normalized.length < 5) return true;
    if (!/^\d{5}$/.test(normalized)) {
      return 'Postnummer måste bestå av 5 siffror.';
    }
    return true;
  },
};

function jsonFieldToBlock(f: JsonFormField): FormFieldBlock {
  const blockType = FIELD_TYPE_TO_BLOCK_TYPE[f.fieldType] ?? 'formFieldText';
  const block: FormFieldBlock = {
    blockType,
    name: f.name,
    label: f.label,
    required: f.required ?? false,
    placeholder: f.placeholder,
    helpText: f.helpText,
    options: f.options,
    minYear: f.minYear,
    maxYear: f.maxYear,
    inputMode: f.inputMode as FormFieldBlock['inputMode'],
    pattern: f.pattern,
    maxLength: f.maxLength,
  };
  if (f.defaultValue !== undefined) block.defaultValue = f.defaultValue;
  if (f.validation && VALIDATION_PRESETS[f.validation]) {
    (block as Record<string, unknown>).validation = VALIDATION_PRESETS[f.validation];
  }
  if (f.conditionalField) {
    block.conditionalField = f.conditionalField;
  }
  return block;
}

function jsonSectionToBlock(s: JsonFormSection): FormSectionBlock {
  return {
    blockType: 'formSection',
    title: s.title,
    fields: s.fields.map(jsonFieldToBlock),
  };
}

function jsonToFormContent(json: JsonFormConfig): FormContentBlock[] {
  return json.sections.map(jsonSectionToBlock);
}

/** Form slugs that have a JSON file in content/forms */
export type FormSlug = 'personal' | 'business' | 'account' | 'medlemskap';

const FORM_SLUGS: FormSlug[] = ['personal', 'business', 'account', 'medlemskap'];

const FORM_JSON: Record<FormSlug, JsonFormConfig> = {
  personal: personalJson as JsonFormConfig,
  business: businessJson as JsonFormConfig,
  account: accountJson as JsonFormConfig,
  medlemskap: medlemskapJson as JsonFormConfig,
};

function loadJsonFormConfig(slug: FormSlug): JsonFormConfig {
  const config = FORM_JSON[slug];
  if (!config) throw new Error(`Unknown form slug: ${slug}`);
  return config;
}

/**
 * Load a form configuration from its JSON file.
 * Returns a partial FormConfig (content + labels); caller must set onSubmit and optionally defaults.
 */
export function getFormConfigFromJson(slug: FormSlug): Omit<FormConfig, 'onSubmit'> {
  const json = loadJsonFormConfig(slug);
  const content = jsonToFormContent(json);
  return {
    content,
    submitButtonLabel: json.submitButtonLabel,
    successMessage: json.successMessage,
    showSuccessMessage: json.showSuccessMessage,
    submitButtonVariant: json.submitButtonVariant,
    submitSectionTitle: json.submitSectionTitle,
    submitButtonClassName: json.submitButtonClassName,
    submitButtonSize: json.submitButtonSize,
  };
}

export function getFormSlugs(): FormSlug[] {
  return [...FORM_SLUGS];
}
