import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/lib/announcements';

/**
 * API route to fetch active announcements
 * GET /api/announcements
 */
export async function GET() {
  try {
    const announcements = await getActiveAnnouncements();
    return NextResponse.json(announcements, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json([]);
  }
}
