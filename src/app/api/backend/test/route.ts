import { NextResponse } from 'next/server';
import BackendAPI from '@/lib/backendApi';

/**
 * Test connection to backend API
 * GET /api/backend/test
 */
export async function GET() {
  try {
    const result = await BackendAPI.testConnection();
    return NextResponse.json(result);
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
