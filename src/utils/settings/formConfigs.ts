/**
 * Settings Page Form Configurations
 * Define all form configurations for different tabs here
 */

import { createField, createSection } from '@/components/forms';
import type { FormConfig } from '@/components/forms';
import type { User } from '@/lib/backendApi';
import { LOCATION_OPTIONS, GENDER_OPTIONS } from '@/utils/settings/constants';

/**
 * Creates the personal information form configuration
 * Easy to modify: add/remove fields, change options, update requirements
 */
export function createPersonalFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  // Get default values from user data
  const defaults = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    location: user?.location || '',
    gender: user?.gender || '',
  };

  return {
    sections: [
      createSection('Personuppgifter', [
        // Required fields
        createField('name', 'Namn', 'text', {
          required: true,
          placeholder: 'För- och efternamn',
          helpText: 'Detta är ditt offentliga visningsnamn.',
          defaultValue: defaults.name,
        }),
        createField('email', 'Email', 'email', {
          required: true,
          placeholder: 'Din e-postadress',
          defaultValue: defaults.email,
        }),

        // Optional fields
        createField('phone', 'Mobilnummer', 'tel', {
          required: false,
          placeholder: 'Ditt mobilnummer',
          defaultValue: defaults.phone,
        }),
        createField('dateOfBirth', 'Födelsedatum', 'date', {
          required: false,
          placeholder: 'MM/DD/AAAA',
          defaultValue: defaults.dateOfBirth,
        }),
        createField('location', 'Vart är du baserad?', 'select', {
          required: false,
          placeholder: 'Välj',
          defaultValue: defaults.location,
          options: LOCATION_OPTIONS,
        }),
        createField('gender', 'Vilket kön identifierar du dig som?', 'select', {
          required: false,
          defaultValue: defaults.gender,
          options: GENDER_OPTIONS,
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
 */
export function createBusinessFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  return {
    sections: [
      createSection('Verksamhetsinformation', [
        // Add business fields here
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
 */
export function createAccountFormConfig(
  user: User | null,
  onSubmit: (data: Record<string, unknown>) => Promise<void>
): FormConfig {
  return {
    sections: [
      createSection('Kontoinställningar', [
        // Add account fields here
      ]),
    ],
    submitButtonLabel: 'SPARA',
    onSubmit,
    successMessage: 'Inställningar sparade!',
    showSuccessMessage: true,
  };
}
