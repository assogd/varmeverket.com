import { cookies } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/backendApi';

export const buildCombinedCookieHeader = (headerCookie?: string): string => {
  const cookieStore = cookies();
  const localCookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  return [headerCookie, localCookieHeader].filter(Boolean).join('; ');
};

export const fetchServerSession = async (
  headerCookie?: string
): Promise<Record<string, unknown> | null> => {
  const combinedCookieHeader = buildCombinedCookieHeader(headerCookie);
  const response = await fetch(`${BACKEND_API_URL}/session`, {
    method: 'GET',
    headers: {
      ...(combinedCookieHeader ? { Cookie: combinedCookieHeader } : {}),
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
};
