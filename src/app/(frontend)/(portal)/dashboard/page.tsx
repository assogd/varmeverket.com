import { getActiveAnnouncements } from '@/lib/announcements';
import { DashboardGate } from './DashboardGate';
import type { Announcement } from '@/lib/announcements';
import { headers } from 'next/headers';
import { fetchServerSession } from '@/lib/serverSession';

const LOGIN_FLOW_DEBUG = process.env.LOGIN_FLOW_DEBUG === 'true';
const DASHBOARD_SESSION_TIMEOUT_MS = 1500;
const DASHBOARD_ANNOUNCEMENTS_TIMEOUT_MS = 2000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T
): Promise<T> {
  if (timeoutMs <= 0) return promise;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>(resolve => {
        timeout = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function DashboardPage() {
  const startedAt = Date.now();
  const headerList = await headers();
  const headerCookie = headerList.get('cookie') || '';
  const [serverSession, announcementsResult] = await Promise.all([
    fetchServerSession(headerCookie, {
      timeoutMs: DASHBOARD_SESSION_TIMEOUT_MS,
    }),
    withTimeout(
      getActiveAnnouncements().catch(error => {
        console.error('Failed to fetch announcements:', error);
        return [] as Announcement[];
      }),
      DASHBOARD_ANNOUNCEMENTS_TIMEOUT_MS,
      [] as Announcement[]
    ),
  ]);
  const initialUserEmail =
    typeof (serverSession?.user as { email?: unknown } | undefined)?.email === 'string'
      ? ((serverSession?.user as { email: string }).email ?? null)
      : null;

  if (LOGIN_FLOW_DEBUG) {
    console.info(
      `[login-flow] dashboard server-session ${
        initialUserEmail ? 'hit' : 'miss'
      } ${Date.now() - startedAt}ms`
    );
  }

  const announcements = announcementsResult;

  return (
    <DashboardGate
      announcements={announcements}
      initialUserEmail={initialUserEmail}
    />
  );
}
