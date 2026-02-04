import type { Booking } from '@/components/ui/BookingsList';
import { formatSingleTime } from '@/utils/dateFormatting';

export interface CalendarItem {
  id: string;
  startsAt: Date;
  endsAt: Date;
  title: string;
  type: 'booking' | 'event' | 'course';
  status?: 'booked' | 'saved' | 'registered';
  space?: string;
  image?: string;
}

export interface CalendarDayGroup {
  date: Date;
  label: string;
  items: CalendarItem[];
}

/**
 * Convert bookings to calendar items
 * Filters out past bookings
 */
export function bookingsToCalendarItems(
  bookings: Booking[] | null | undefined
): CalendarItem[] {
  if (!bookings || !Array.isArray(bookings)) {
    return [];
  }

  const now = new Date();
  return bookings
    .filter(booking => {
      const startDate = new Date(booking.start);
      return startDate >= now;
    })
    .map(booking => ({
      id: `booking-${booking.idx}`,
      startsAt: new Date(booking.start),
      endsAt: new Date(booking.end),
      title: booking.space || 'Bokning',
      type: 'booking',
      status: 'booked',
      space: booking.space,
    }));
}

/**
 * Group calendar items by day
 */
export function groupCalendarItemsByDay(
  items: CalendarItem[]
): CalendarDayGroup[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const groups = new Map<string, CalendarItem[]>();

  // Sort items by start time
  const sortedItems = [...items].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
  );

  for (const item of sortedItems) {
    const itemDate = new Date(item.startsAt);
    itemDate.setHours(0, 0, 0, 0);
    const dateKey = itemDate.toISOString();

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  }

  // Convert to array and format labels
  const dayGroups: CalendarDayGroup[] = Array.from(groups.entries()).map(
    ([dateKey, items]) => {
      const date = new Date(dateKey);
      const label = formatDayLabel(date, now);
      return { date, label, items };
    }
  );

  // Sort by date
  dayGroups.sort((a, b) => a.date.getTime() - b.date.getTime());

  return dayGroups;
}

/**
 * Format day label in Swedish.
 * Today: "idag"
 * Tomorrow: "imorgon" then "tisdag 22 oktober" (use \n for two lines)
 * Other: "onsdag 23 oktober"
 */
function formatDayLabel(date: Date, today: Date): string {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayNames = [
    'söndag',
    'måndag',
    'tisdag',
    'onsdag',
    'torsdag',
    'fredag',
    'lördag',
  ];
  const monthNames = [
    'januari',
    'februari',
    'mars',
    'april',
    'maj',
    'juni',
    'juli',
    'augusti',
    'september',
    'oktober',
    'november',
    'december',
  ];

  const dayOfWeek = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const dateLine = `${dayOfWeek} ${day} ${month}`;

  if (date.toDateString() === today.toDateString()) {
    return `idag\n${dateLine}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `imorgon\n${dateLine}`;
  }
  return dateLine;
}
