/**
 * Settings Page Form Configurations
 * Define all form configurations for different tabs here
 * 
 * Uses the new blocks-based form system for consistency with Payload CMS forms
 */

import {
  createFieldBlock,
  createSectionBlock,
} from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import type { User } from '@/lib/backendApi';

/**
 * Creates the personal information form configuration
 * Easy to modify: add/remove fields, change options, update requirements
 * Uses the new blocks-based structure for consistency with CMS forms
 */
export function createPersonalFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  // Get default values from user data
  const profileDefaultValue = (() => {
    const profileValue = user?.profile;
    if (profileValue === null || profileValue === undefined) return '';
    if (typeof profileValue === 'string') {
      const trimmed = profileValue.trim();
      if (!trimmed || trimmed === 'null') return '';
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed === null) return '';
        return JSON.stringify(parsed, null, 2);
      } catch {
        return trimmed;
      }
    }
    if (typeof profileValue === 'object') {
      if (Array.isArray(profileValue)) {
        return JSON.stringify(profileValue, null, 2);
      }
      if (Object.keys(profileValue).length === 0) return '';
      return JSON.stringify(profileValue, null, 2);
    }
    return String(profileValue);
  })();

  const defaults = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
    address_street: user?.address_street || '',
    address_code: user?.address_code ?? '',
    address_city: user?.address_city || '',
    profile: profileDefaultValue,
  };

  return {
    content: [
      createSectionBlock('Personuppgifter', [
        // Required fields
        createFieldBlock('name', 'Namn', 'text', {
          required: true,
          placeholder: 'För- och efternamn',
          helpText: 'Detta är ditt offentliga visningsnamn.',
          defaultValue: defaults.name,
        }),
        createFieldBlock('email', 'Email', 'email', {
          required: true,
          placeholder: 'Din e-postadress',
          defaultValue: defaults.email,
        }),

        // Optional fields
        createFieldBlock('phone', 'Mobilnummer', 'tel', {
          required: false,
          placeholder: 'Ditt mobilnummer',
          defaultValue: defaults.phone,
        }),
        createFieldBlock('birthdate', 'Födelsedatum', 'date', {
          required: false,
          placeholder: 'YYYY-MM-DD',
          defaultValue: defaults.birthdate,
        }),
        createFieldBlock('address_street', 'Adress', 'text', {
          required: false,
          placeholder: 'Gata och nummer',
          defaultValue: defaults.address_street,
        }),
        createFieldBlock('address_code', 'Postnummer', 'text', {
          required: false,
          placeholder: 'Postnummer',
          defaultValue: defaults.address_code,
        }),
        createFieldBlock('address_city', 'Stad', 'text', {
          required: false,
          placeholder: 'Stad',
          defaultValue: defaults.address_city,
        }),
        createFieldBlock('profile', 'Profil (JSON)', 'textarea', {
          required: false,
          placeholder: '{ "title": "developer", "organisation": "Värmeverket" }',
          helpText:
            'Skriv in giltig JSON. Lämna tomt om du inte vill spara profilmetadata.',
          defaultValue: defaults.profile,
        }),
      ]),
    ],
    submitButtonLabel: 'SPARA',
    onSubmit,
    successMessage: 'Inställningar sparade!',
    showSuccessMessage: true,
  };
}

/**
 * Creates the business information form configuration
 * TODO: Add fields when ready
 * Uses the new blocks-based structure
 */
export function createBusinessFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  return {
    content: [
      createSectionBlock('Uppgifter om din kreativa verksamhet', [
        createFieldBlock('occupation', 'Sysselsättning', 'text', {
          required: false,
          placeholder: 'Vad jobbar du med...',
        }),
        createFieldBlock(
          'creativeField',
          'Inom vilket område verkar du inom?',
          'select',
          {
            required: false,
            placeholder: 'Välj',
            options: [
              { label: 'Visuell konst', value: 'visuell-konst' },
              { label: 'Scenkonst', value: 'scenkonst' },
              { label: 'Musik', value: 'musik' },
              { label: 'Litteratur och skrivande', value: 'litteratur' },
              { label: 'Övrigt', value: 'ovrigt' },
            ],
          }
        ),
        createFieldBlock('creativeFieldOther', 'Vänligen specificera', 'text', {
          required: false,
          placeholder: 'Övrigt',
        }),
        createFieldBlock(
          'membershipMotivation',
          'Berätta med egna ord varför du söker medlemskap i Värmeverket och vad du hoppas kunna bidra med till vår community',
          'textarea',
          {
            required: false,
            placeholder: 'Skriv här',
          }
        ),
      ]),
    ],
    submitButtonLabel: 'SPARA',
    onSubmit,
    successMessage: 'Inställningar sparade!',
    showSuccessMessage: true,
  };
}

/**
 * Creates the account settings form configuration
 * TODO: Add fields when ready
 * Uses the new blocks-based structure
 */
export function createAccountFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  return {
    content: [
      createSectionBlock('Kontoinställningar', [
        // Add account fields here using createFieldBlock
      ]),
    ],
    submitButtonLabel: 'SPARA',
    onSubmit,
    successMessage: 'Inställningar sparade!',
    showSuccessMessage: true,
  };
}
