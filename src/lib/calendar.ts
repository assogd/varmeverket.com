import type { Booking } from '@/components/ui/BookingsList';
import { formatSingleTime } from '@/utils/dateFormatting';
import { fixImageUrl } from '@/utils/imageUrl';

export interface CalendarItem {
  id: string;
  startsAt: Date;
  endsAt: Date;
  title: string;
  href?: string;
  type: 'booking' | 'event' | 'course';
  status?: 'booked' | 'saved' | 'registered' | 'featured';
  isAllDay?: boolean;
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

export interface CalendarEvent {
  id: string;
  title?: string | null;
  slug?: string | null;
  href?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  isAllDay?: boolean | null;
  featuredImage?: { url: string; alt?: string | null } | null;
}

function isUpcoming(startsAt: Date, endsAt: Date): boolean {
  const now = new Date();
  // Include ongoing events (already started but not ended yet).
  return endsAt >= now;
}

export function eventsToCalendarItems(
  events: CalendarEvent[] | null | undefined,
  status: Extract<NonNullable<CalendarItem['status']>, 'featured' | 'saved'>
): CalendarItem[] {
  if (!events || !Array.isArray(events)) return [];

  return events
    .filter(e => Boolean(e?.startDateTime))
    .map(e => {
      const startsAt = new Date(e.startDateTime as string);
      const endsAt = e.endDateTime
        ? new Date(e.endDateTime)
        : new Date(e.startDateTime as string);

      return {
        id: e.id,
        startsAt,
        endsAt,
        title: e.title || e.id,
        href: e.href ?? (e.slug ? `/evenemang/${e.slug}` : undefined),
        type: 'event' as const,
        status,
        isAllDay: Boolean(e.isAllDay),
        image: fixImageUrl(e.featuredImage?.url),
      };
    })
    .filter(item => isUpcoming(item.startsAt, item.endsAt));
}

function statusPriority(status: CalendarItem['status']): number {
  switch (status) {
    case 'featured':
      return 3;
    case 'saved':
      return 2;
    case 'registered':
      return 1;
    case 'booked':
      return 0;
    default:
      return -1;
  }
}

/**
 * Merge and dedupe calendar items.
 * If the same `event` appears as both featured and saved, keep the higher priority status (featured).
 */
export function mergeCalendarItems(
  bookings: CalendarItem[],
  featured: CalendarItem[],
  saved: CalendarItem[]
): CalendarItem[] {
  const now = new Date();

  const combined = [...bookings, ...featured, ...saved].filter(item => {
    // Always filter out past items.
    return item.endsAt >= now;
  });

  const dedupedById = new Map<string, CalendarItem>();

  for (const item of combined) {
    const prev = dedupedById.get(item.id);
    if (!prev) {
      dedupedById.set(item.id, item);
      continue;
    }

    // Prefer higher-priority status (e.g. featured over saved).
    if (statusPriority(item.status) > statusPriority(prev.status)) {
      dedupedById.set(item.id, item);
    }
  }

  return Array.from(dedupedById.values()).sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
  );
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
