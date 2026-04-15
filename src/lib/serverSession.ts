import { cookies } from 'next/headers';
import { BACKEND_API_URL } from '@/lib/backendApi';
const LOGIN_FLOW_DEBUG = process.env.LOGIN_FLOW_DEBUG === 'true';

export const buildCombinedCookieHeader = async (
  headerCookie?: string
): Promise<string> => {
  const cookieStore = await cookies();
  const localCookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  return [headerCookie, localCookieHeader].filter(Boolean).join('; ');
};

export const fetchServerSession = async (
  headerCookie?: string
): Promise<Record<string, unknown> | null> => {
  const startedAt = Date.now();
  const combinedCookieHeader = await buildCombinedCookieHeader(headerCookie);
  const response = await fetch(`${BACKEND_API_URL}/session`, {
    method: 'GET',
    headers: {
      ...(combinedCookieHeader ? { Cookie: combinedCookieHeader } : {}),
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (LOGIN_FLOW_DEBUG) {
      console.info(
        `[login-flow] server-session status=${response.status} ${Date.now() - startedAt}ms`
      );
    }
    return null;
  }

  const json = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (LOGIN_FLOW_DEBUG) {
    console.info(`[login-flow] server-session ok ${Date.now() - startedAt}ms`);
  }

  return json;
};
