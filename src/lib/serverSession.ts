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
  headerCookie?: string,
  options?: { timeoutMs?: number }
): Promise<Record<string, unknown> | null> => {
  const startedAt = Date.now();
  const combinedCookieHeader = await buildCombinedCookieHeader(headerCookie);
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutMs = options?.timeoutMs ?? 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  if (controller && timeoutMs > 0) {
    timeout = setTimeout(() => controller.abort(), timeoutMs);
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}/session`, {
      method: 'GET',
      headers: {
        ...(combinedCookieHeader ? { Cookie: combinedCookieHeader } : {}),
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller?.signal,
    });
  } catch (error) {
    if (timeout) clearTimeout(timeout);
    if (LOGIN_FLOW_DEBUG) {
      const label =
        error instanceof Error && error.name === 'AbortError'
          ? 'server-session timeout'
          : 'server-session error';
      console.info(`[login-flow] ${label} ${Date.now() - startedAt}ms`);
    }
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

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
