/**
 * Settings Page Handlers
 * Form submission and data handling logic with optimistic updates
 */

import { getUserByEmail, updateUser } from '@/services/userService';
import { clearUserCache } from '@/hooks/useUser';
import type { User } from '@/lib/backendApi';

/**
 * Handles submission of personal information form
 * Uses service layer for consistent error handling
 *
 * Note: Extended fields (phone, birthdate, address, profile) are only sent
 * if they have values. Empty strings are filtered out to avoid sending unnecessary data.
 */
const KNOWN_USER_FIELDS = new Set([
  'name',
  'email',
  'phone',
  'birthdate',
  'address_street',
  'address_code',
  'address_city',
]);

export async function handlePersonalFormSubmit(
  userEmail: string,
  data: Record<string, unknown>,
  existingProfile?: User['profile'] | null
): Promise<User> {
  // Build update payload - only include fields with actual values
  const updateData: Parameters<typeof updateUser>[1] = {
    name: data.name as string,
  };
  if (
    data.email &&
    typeof data.email === 'string' &&
    data.email.trim() &&
    data.email.trim() !== userEmail
  ) {
    updateData.email = data.email.trim();
  }

  // Only include extended fields if they have values (not empty strings)
  // This prevents sending empty data to backend that may not support these fields yet
  if (data.phone && typeof data.phone === 'string' && data.phone.trim()) {
    updateData.phone = data.phone.trim();
  }
  if (
    data.birthdate &&
    typeof data.birthdate === 'string' &&
    data.birthdate.trim()
  ) {
    updateData.birthdate = data.birthdate.trim();
  }
  if (
    data.address_street &&
    typeof data.address_street === 'string' &&
    data.address_street.trim()
  ) {
    updateData.address_street = data.address_street.trim();
  }
  if (
    data.address_code !== undefined &&
    data.address_code !== null &&
    String(data.address_code).trim()
  ) {
    const code = String(data.address_code).replace(/\s+/g, '');
    if (!/^\d{5}$/.test(code)) {
      throw new Error('Postnummer måste bestå av 5 siffror.');
    }
    updateData.address_code = Number(code);
  }
  if (
    data.address_city &&
    typeof data.address_city === 'string' &&
    data.address_city.trim()
  ) {
    updateData.address_city = data.address_city.trim();
  }
  const profileBase =
    existingProfile && typeof existingProfile === 'object'
      ? existingProfile
      : {};
  const extraProfileData = Object.entries(data).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (KNOWN_USER_FIELDS.has(key)) return acc;
      if (value === null || value === undefined) return acc;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return acc;
        acc[key] = trimmed;
        return acc;
      }
      if (typeof value === 'number') {
        if (Number.isNaN(value)) return acc;
        acc[key] = value;
        return acc;
      }
      if (typeof value === 'boolean') {
        acc[key] = value;
        return acc;
      }
      acc[key] = value;
      return acc;
    },
    {}
  );

  if (Object.keys(extraProfileData).length > 0) {
    updateData.profile = {
      ...(profileBase as Record<string, unknown>),
      ...extraProfileData,
    };
  }

  console.log('📤 Updating user with data:', updateData);

  const updatedUser = await updateUser(userEmail, updateData);

  console.log('✅ User updated, response:', {
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    birthdate: updatedUser.birthdate,
    address_street: updatedUser.address_street,
    address_code: updatedUser.address_code,
    address_city: updatedUser.address_city,
    profile: updatedUser.profile,
  });

  // Check if extended fields were sent but not saved (backend doesn't support them yet)
  const sentExtendedFields = {
    phone: updateData.phone,
    birthdate: updateData.birthdate,
    address_street: updateData.address_street,
    address_code: updateData.address_code,
    address_city: updateData.address_city,
    profile: updateData.profile,
  };
  const receivedExtendedFields = {
    phone: updatedUser.phone,
    birthdate: updatedUser.birthdate,
    address_street: updatedUser.address_street,
    address_code: updatedUser.address_code,
    address_city: updatedUser.address_city,
    profile: updatedUser.profile,
  };

  const hasUnsupportedFields = Object.keys(sentExtendedFields).some(
    key =>
      sentExtendedFields[key as keyof typeof sentExtendedFields] &&
      !receivedExtendedFields[key as keyof typeof receivedExtendedFields]
  );

  if (hasUnsupportedFields) {
    console.warn(
      '⚠️ Some extended fields were sent but not returned by backend. Backend may not support these fields yet:',
      {
        sent: sentExtendedFields,
        received: receivedExtendedFields,
      }
    );
  }

  // Clear cache to ensure fresh data on next fetch
  clearUserCache(userEmail);

  return updatedUser;
}

/** Business form field names (stored in user.profile) */
const BUSINESS_PROFILE_KEYS = [
  'occupation',
  'creativeField',
  'creativeFieldOther',
  'membershipMotivation',
] as const;

/**
 * Handles submission of business information form.
 * Persists business fields into user.profile via PATCH /v2/users/:email.
 */
export async function handleBusinessFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<User> {
  const existingUser = await getUserByEmail(userEmail).catch(() => null);
  const existingProfile =
    existingUser?.profile && typeof existingUser.profile === 'object'
      ? (existingUser.profile as Record<string, unknown>)
      : {};

  const businessData: Record<string, unknown> = {};
  for (const key of BUSINESS_PROFILE_KEYS) {
    const value = data[key];
    if (value === undefined) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      businessData[key] = trimmed || null;
    } else {
      businessData[key] = value;
    }
  }

  const mergedProfile = {
    ...existingProfile,
    ...businessData,
  };

  const updatedUser = await updateUser(userEmail, { profile: mergedProfile });

  clearUserCache(userEmail);
  return updatedUser;
}

/**
 * Handles submission of account settings form
 * TODO: Implement when backend supports account fields
 */
export async function handleAccountFormSubmit(
  userEmail: string,
  data: Record<string, unknown>
): Promise<void> {
  // TODO: Implement account form submission
  console.log('Account form data:', data);
  // Clear cache when implemented
  clearUserCache(userEmail);
}
