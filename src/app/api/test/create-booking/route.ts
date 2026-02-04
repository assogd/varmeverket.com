/**
 * Temporary test endpoint to create a booking for the logged-in user
 * DELETE THIS FILE after testing!
 * 
 * Usage: Call POST /api/test/create-booking with { email } in the body
 */

import { NextRequest, NextResponse } from 'next/server';
import BackendAPI from '@/lib/backendApi';

export async function POST(request: NextRequest) {
  try {
    // Get email from request body (client will pass it)
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required in request body' },
        { status: 400 }
      );
    }
    
    // Create a test booking for tomorrow, 1 hour slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0); // 3 PM

    // Format: "2024-11-04 17:00"
    const formatDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const bookingData = {
      email,
      space: 'Studio Container 2', // Default space - you can change this
      start: formatDateTime(tomorrow),
      end: formatDateTime(endTime),
    };

    console.log('📅 Creating test booking for:', email);
    console.log('Booking data:', bookingData);

    const booking = await BackendAPI.createBooking(bookingData);

    return NextResponse.json({
      success: true,
      message: 'Test booking created successfully!',
      booking,
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
