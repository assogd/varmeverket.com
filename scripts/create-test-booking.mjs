/**
 * Script to create a test booking
 * Usage: node scripts/create-test-booking.mjs <email> [space] [start] [end]
 * 
 * Example:
 * node scripts/create-test-booking.mjs user@example.com "Studio Container 2" "2024-12-20 14:00" "2024-12-20 15:00"
 */

import 'dotenv/config';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

const email = process.argv[2];
const space = process.argv[3] || 'Studio Container 2';
const start = process.argv[4] || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
const end = process.argv[5] || new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('\nUsage: node scripts/create-test-booking.mjs <email> [space] [start] [end]');
  console.log('\nExample:');
  console.log('  node scripts/create-test-booking.mjs user@example.com "Studio Container 2" "2024-12-20 14:00" "2024-12-20 15:00"');
  process.exit(1);
}

const bookingData = {
  email,
  space,
  start,
  end,
};

console.log('📅 Creating test booking...');
console.log('Data:', bookingData);

try {
  const response = await fetch(`${BACKEND_API_URL}/v2/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to create booking: ${response.status} ${errorData.message || response.statusText}`);
  }

  const booking = await response.json();
  console.log('✅ Booking created successfully!');
  console.log('Booking details:', JSON.stringify(booking, null, 2));
} catch (error) {
  console.error('❌ Error creating booking:', error.message);
  process.exit(1);
}
