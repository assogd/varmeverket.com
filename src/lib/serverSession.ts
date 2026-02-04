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
  const cookieNames = combinedCookieHeader ? combinedCookieHeader.split(';').map(s => s.trim().split('=')[0]).filter(Boolean) : [];

  // #region agent log
  await fetch('http://127.0.0.1:7245/ingest/f7f14da6-8371-465e-9a52-bf7ad8a2ae59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'serverSession.ts:fetchServerSession:before',message:'Server session check',data:{cookieHeaderLength:combinedCookieHeader?.length??0,cookieNames,hasHeaderCookie:!!headerCookie},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const response = await fetch(`${BACKEND_API_URL}/session`, {
    method: 'GET',
    headers: {
      ...(combinedCookieHeader ? { Cookie: combinedCookieHeader } : {}),
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  // #region agent log
  await fetch('http://127.0.0.1:7245/ingest/f7f14da6-8371-465e-9a52-bf7ad8a2ae59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'serverSession.ts:fetchServerSession:after',message:'Backend session response',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  return json;
};
