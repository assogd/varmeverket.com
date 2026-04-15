import { getActiveAnnouncements } from '@/lib/announcements';
import { DashboardGate } from './DashboardGate';
import type { Announcement } from '@/lib/announcements';
import { headers } from 'next/headers';
import { fetchServerSession } from '@/lib/serverSession';

const LOGIN_FLOW_DEBUG = process.env.LOGIN_FLOW_DEBUG === 'true';

export default async function DashboardPage() {
  const startedAt = Date.now();
  const headerList = await headers();
  const headerCookie = headerList.get('cookie') || '';
  const serverSession = await fetchServerSession(headerCookie);
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

  let announcements: Announcement[] = [];

  try {
    announcements = await getActiveAnnouncements();
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  }

  return (
    <DashboardGate
      announcements={announcements}
      initialUserEmail={initialUserEmail}
    />
  );
}
