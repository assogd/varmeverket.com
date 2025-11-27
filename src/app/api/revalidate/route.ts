import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST() {
  try {
    // Revalidate all paths to ensure fresh data
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidateTag('navigation');

    return NextResponse.json({
      success: true,
      message: 'Navigation data revalidated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate navigation data',
      },
      { status: 500 }
    );
  }
}
