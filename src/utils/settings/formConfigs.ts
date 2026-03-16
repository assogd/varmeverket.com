/**
 * Settings Page Form Configurations
 * Form structure is defined in src/content/forms/*.json (edit those to change fields).
 * Here we load the JSON config and inject user defaults + submit handler.
 */

import type {
  FormConfig,
  FormContentBlock,
  FormFieldBlock,
  FormSectionBlock,
} from '@/components/forms/types';
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
  let content = applyDefaultsToContent(base.content ?? [], defaults);
  // Födelsedatum: cap year at (current - 15) so under-15 cannot be selected
  const maxBirthYear = new Date().getFullYear() - 15;
  content = content.map(block => {
    if (block.blockType !== 'formSection') return block;
    const section = block as FormSectionBlock;
    if (!section.fields?.length) return block;
    const fields = section.fields.map(f =>
      f.name === 'birthdate' ? { ...f, maxYear: maxBirthYear } : f
    );
    return { ...section, fields };
  });
  return {
    ...base,
    content,
    onSubmit,
  };
}

/** Business form field names (must match handlers + business.json) */
const BUSINESS_FIELD_NAMES = [
  'occupation',
  'creativeField',
  'creativeFieldOther',
  'membershipMotivation',
];

/**
 * Creates the business information form configuration.
 * Structure from content/forms/business.json; defaults from user.profile.
 */
export function createBusinessFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  const base = getFormConfigFromJson('business');
  const profile =
    user?.profile && typeof user.profile === 'object'
      ? (user.profile as Record<string, unknown>)
      : {};

  const defaults: Record<string, string> = {};
  for (const name of BUSINESS_FIELD_NAMES) {
    const v = profile[name];
    if (v !== undefined && v !== null) defaults[name] = String(v);
  }

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '95ada4' },
      body: JSON.stringify({
        sessionId: '95ada4',
        hypothesisId: 'H5',
        location: 'formConfigs.ts:createBusinessFormConfig',
        message: 'business form defaults',
        data: {
          hasUser: !!user,
          hasProfile: !!user?.profile,
          profileKeys: user?.profile && typeof user.profile === 'object' ? Object.keys(user.profile as object) : [],
          defaultsKeys: Object.keys(defaults),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  const content = applyDefaultsToContent(base.content ?? [], defaults);
  return {
    ...base,
    content,
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
