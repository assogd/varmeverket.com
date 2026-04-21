import { NextRequest, NextResponse } from 'next/server';

/**
 * Example form submission endpoint
 * POST /api/form-example
 *
 * This is a demonstration endpoint. In production, you would:
 * - Validate the data server-side
 * - Store it in a database
 * - Send email notifications
 * - etc.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Log the submission (in production, save to database)
    console.log('📝 Form submission received:', data);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real application, you might:
    // - Save to database
    // - Send email notification
    // - Trigger webhooks
    // - etc.

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully!',
      data: {
        id: `submission-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to submit form',
      },
      { status: 500 }
    );
  }
}
