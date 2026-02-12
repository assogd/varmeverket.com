/**
 * Settings Page Form Configurations
 * Form structure is defined in src/content/forms/*.json (edit those to change fields).
 * Here we load the JSON config and inject user defaults + submit handler.
 */

import type { FormConfig, FormContentBlock, FormFieldBlock, FormSectionBlock } from '@/components/forms/types';
import type { User } from '@/lib/backendApi';
import { getFormConfigFromJson } from '@/lib/loadFormFromJson';

function applyDefaultsToContent(
  content: FormContentBlock[],
  defaults: Record<string, string>
): FormContentBlock[] {
  return content.map(block => {
    if (block.blockType !== 'formSection') return block;
    const section = block as FormSectionBlock;
    if (!section.fields?.length) return block;
    const fields = section.fields.map(f => {
      const value = defaults[f.name];
      if (value === undefined) return f;
      return { ...f, defaultValue: value } as FormFieldBlock;
    });
    return { ...section, fields };
  });
}

/**
 * Creates the personal information form configuration.
 * Structure from content/forms/personal.json; defaults and onSubmit injected here.
 */
export function createPersonalFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  const base = getFormConfigFromJson('personal');
  const defaults = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
    address_street: user?.address_street || '',
    address_code:
      user?.address_code !== undefined && user?.address_code !== null
        ? String(user.address_code)
        : '',
    address_city: user?.address_city || '',
  };
  const content = applyDefaultsToContent(base.content ?? [], defaults);
  return {
    ...base,
    content,
    onSubmit,
  };
}

/**
 * Creates the business information form configuration.
 * Structure from content/forms/business.json.
 */
export function createBusinessFormConfig(
  _user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  const base = getFormConfigFromJson('business');
  return {
    ...base,
    onSubmit,
  };
}

/**
 * Creates the account settings form configuration.
 * Structure from content/forms/account.json (currently empty sections).
 */
export function createAccountFormConfig(
  _user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  const base = getFormConfigFromJson('account');
  return {
    ...base,
    onSubmit,
  };
}
