import { DashboardGate } from './DashboardGate';
import { headers } from 'next/headers';
import { fetchServerSession } from '@/lib/serverSession';

const LOGIN_FLOW_DEBUG = process.env.LOGIN_FLOW_DEBUG === 'true';
const DASHBOARD_SESSION_TIMEOUT_MS = 1500;

export default async function DashboardPage() {
  const startedAt = Date.now();
  const headerList = await headers();
  const headerCookie = headerList.get('cookie') || '';
  const serverSession = await fetchServerSession(headerCookie, {
    timeoutMs: DASHBOARD_SESSION_TIMEOUT_MS,
  });
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

  return (
    <DashboardGate
      initialAnnouncements={[]}
      initialUserEmail={initialUserEmail}
    />
  );
}
