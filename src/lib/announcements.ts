import { PayloadAPI } from '@/lib/api';

export interface Announcement {
  id: string;
  title: string;
  content: unknown; // Rich text content from Payload
  priority: number;
  isEnabled: boolean;
  startsAt?: string;
  endsAt?: string;
  updatedAt: string;
  createdAt: string;
}

function isAnnouncementActive(announcement: Announcement, now: Date): boolean {
  if (!announcement.isEnabled) return false;

  const startsAt = announcement.startsAt ? new Date(announcement.startsAt) : null;
  const endsAt = announcement.endsAt ? new Date(announcement.endsAt) : null;

  // Guard against invalid date strings; treat invalid constraints as non-active.
  if (startsAt && Number.isNaN(startsAt.getTime())) return false;
  if (endsAt && Number.isNaN(endsAt.getTime())) return false;

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return true;
}

/**
 * Get all currently active announcements from Payload
 * Returns announcements sorted by priority (highest first)
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const now = new Date();

  try {
    // Fetch fresh and apply filtering in code since external where-JSON can be unreliable.
    const result = await PayloadAPI.findFresh<Announcement>({
      collection: 'announcements',
      sort: '-priority', // Sort by priority descending (highest first)
      limit: 100, // Reasonable limit for announcements
      depth: 1,
    });

    return (result.docs || []).filter(announcement =>
      isAnnouncementActive(announcement, now)
    );
  } catch (error) {
    console.error('Failed to fetch active announcements:', error);
    return [];
  }
}
