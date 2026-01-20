/**
 * Booking Service
 * 
 * Centralized service for booking operations
 * Provides a clean interface for booking-related API calls
 */

import BackendAPI, { type Booking, type PublicBooking } from '@/lib/backendApi';
import { handleAPIError, retryAPI } from '@/utils/apiErrorHandler';

export interface CreateBookingData {
  email: string;
  space: string;
  start: string; // Format: "2024-11-04 17:00"
  end: string; // Format: "2024-11-04 17:30"
}

/**
 * Get user's bookings
 * 
 * @param email - User email address
 * @returns Array of user's bookings
 */
export async function getUserBookings(email: string): Promise<Booking[]> {
  try {
    return await retryAPI(() => BackendAPI.getBookings(email));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to fetch bookings: ${message}`);
  }
}

/**
 * Create a new booking
 * 
 * @param data - Booking data
 * @returns Created booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  try {
    return await retryAPI(() => BackendAPI.createBooking(data));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to create booking: ${message}`);
  }
}

/**
 * Delete a booking
 * 
 * @param bookingIdx - Booking index/ID
 */
export async function deleteBooking(bookingIdx: number): Promise<void> {
  try {
    await retryAPI(() => BackendAPI.deleteBooking(bookingIdx));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to delete booking: ${message}`);
  }
}

/**
 * Get public calendar for a space
 * 
 * @param space - Space slug or name
 * @returns Array of public bookings (no personal data)
 */
export async function getSpaceCalendar(space: string): Promise<PublicBooking[]> {
  try {
    return await retryAPI(() => BackendAPI.getSpaceCalendar(space));
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to fetch space calendar: ${message}`);
  }
}

/**
 * Get multi-space calendar
 * 
 * @returns Array of public bookings for all spaces
 */
export async function getMultiSpaceCalendar(): Promise<PublicBooking[]> {
  try {
    return await retryAPI(() => BackendAPI.getMultiSpaceCalendar());
  } catch (error) {
    const message = handleAPIError(error);
    throw new Error(`Failed to fetch calendar: ${message}`);
  }
}
