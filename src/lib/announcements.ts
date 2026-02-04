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

/**
 * Get all currently active announcements from Payload
 * Returns announcements sorted by priority (highest first)
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const now = new Date();
  const nowISO = now.toISOString();

  try {
    const result = await PayloadAPI.find<Announcement>({
      collection: 'announcements',
      where: {
        and: [
          {
            isEnabled: {
              equals: true,
            },
          },
          {
            or: [
              {
                startsAt: {
                  less_than_equal: nowISO,
                },
              },
              {
                startsAt: {
                  exists: false,
                },
              },
            ],
          },
          {
            or: [
              {
                endsAt: {
                  greater_than_equal: nowISO,
                },
              },
              {
                endsAt: {
                  exists: false,
                },
              },
            ],
          },
        ],
      },
      sort: '-priority', // Sort by priority descending (highest first)
      limit: 100, // Reasonable limit for announcements
      depth: 1,
    });

    return result.docs || [];
  } catch (error) {
    console.error('Failed to fetch active announcements:', error);
    return [];
  }
}
