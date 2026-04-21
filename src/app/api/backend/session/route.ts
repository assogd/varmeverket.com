import { NextRequest, NextResponse } from 'next/server';
import { fetchServerSession } from '@/lib/serverSession';

/**
 * Get session (server-side proxy)
 * Forwards cookies from the client request to the backend API
 * GET /api/backend/session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const data = await fetchServerSession(cookieHeader);

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated', data: null },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
