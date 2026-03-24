import { getActiveAnnouncements } from '@/lib/announcements';
import { DashboardGate } from './DashboardGate';
import type { Announcement } from '@/lib/announcements';

export default async function DashboardPage() {
  // No server-side session check: session cookie is for api.varmeverket.com and
  // is not sent to this server. Auth is enforced client-side in DashboardGate.
  let announcements: Announcement[] = [];

  try {
    announcements = await getActiveAnnouncements();
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  }

  return <DashboardGate announcements={announcements} />;
}
