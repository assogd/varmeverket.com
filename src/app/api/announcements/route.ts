import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/lib/announcements';

/**
 * Mock announcements for styling/testing
 */
const MOCK_ANNOUNCEMENTS = [
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

/**
 * API route to fetch active announcements
 * GET /api/announcements
 */
export async function GET() {
  try {
    // Use mock data for styling (comment out to use real data)
    const useMockData = process.env.NODE_ENV === 'development';

    if (useMockData) {
      return NextResponse.json(MOCK_ANNOUNCEMENTS, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    const announcements = await getActiveAnnouncements();
    return NextResponse.json(announcements, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    // Fall back to mock data on error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(MOCK_ANNOUNCEMENTS, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
