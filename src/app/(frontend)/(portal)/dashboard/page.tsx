import { getActiveAnnouncements } from '@/lib/announcements';
import { DashboardGate } from './DashboardGate';
import type { Announcement } from '@/lib/announcements';

/**
 * Mock announcements for styling/testing
 */
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'mock-1',
    title: 'VÄRMEVERKET STÄNGT FÖR MEDLEMMAR FREDAG DEN 13:E',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Fredag den 13:e stänger vi huset för en stund av eftertanke, underhåll och intern rörelse. Värmeverket tar en dag i stillhet för att kunna fortsätta vara den plats där idéer, värme och människor möts. På lördag öppnar vi igen, fyllda av ny energi.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    priority: 10,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'NYA WORKSHOPS I FEBRUARI',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Vi är glada att meddela att vi kommer att hålla en serie workshops under februari månad. Alla medlemmar är välkomna att delta. Mer information kommer snart.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    priority: 5,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export default async function DashboardPage() {
  // No server-side session check: session cookie is for api.varmeverket.com and
  // is not sent to this server. Auth is enforced client-side in DashboardGate.
  let announcements: Announcement[] = [];

  try {
    announcements = await getActiveAnnouncements();
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    if (process.env.NODE_ENV === 'development') {
      announcements = MOCK_ANNOUNCEMENTS;
    }
  }

  if (announcements.length === 0 && process.env.NODE_ENV === 'development') {
    announcements = MOCK_ANNOUNCEMENTS;
  }

  return <DashboardGate announcements={announcements} />;
}
