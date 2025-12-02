import { NextResponse } from 'next/server';
import BackendAPI from '@/lib/backendApi';

/**
 * Get spaces (server-side proxy)
 * GET /api/backend/spaces
 */
export async function GET() {
  try {
    const spaces = await BackendAPI.getSpaces();
    return NextResponse.json({ success: true, data: spaces });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

