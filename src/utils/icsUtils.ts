/**
 * Utility functions for ICS (iCalendar) file generation and download
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description?: unknown;
  link?: {
    type: 'internal' | 'external';
    reference?: unknown;
    url?: string;
    text?: string;
  };
}

/**
 * Format date for ICS format (YYYYMMDDTHHMMSSZ)
 * @param date - Date object
 * @returns Formatted date string for ICS
 */
const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Clean description text for ICS format (remove HTML tags)
 * @param description - Rich text description
 * @returns Cleaned description string
 */
const cleanDescriptionForICS = (description: unknown): string => {
  if (!description) return '';

  return JSON.stringify(description)
    .replace(/<[^>]*>/g, '')
    .replace(/"/g, '');
};

/**
 * Generate unique ID for ICS event
 * @returns Unique identifier string
 */
const generateEventUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@varmeverket.com`;
};

/**
 * Generate ICS content for a calendar event
 * @param event - Calendar event object
 * @returns ICS content string
 */
export const generateICSContent = (event: CalendarEvent): string => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  const startICS = formatICSDate(start);
  const endICS = formatICSDate(end);
  const uid = generateEventUID();
  const cleanDescription = cleanDescriptionForICS(event.description);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Heating System//Calendar Event//EN
BEGIN:VEVENT
UID:${uid}
DTSTART:${startICS}
DTEND:${endICS}
SUMMARY:${event.title}
DESCRIPTION:${cleanDescription}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
};

/**
 * Generate filename for ICS file
 * @param eventTitle - Event title
 * @returns Sanitized filename
 */
const generateICSFilename = (eventTitle: string): string => {
  return `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
};

/**
 * Download ICS file for a calendar event
 * @param event - Calendar event object
 */
export const downloadICS = (event: CalendarEvent): void => {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateICSFilename(event.title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate ICS content for multiple events
 * @param events - Array of calendar events
 * @returns ICS content string for multiple events
 */
export const generateMultipleEventsICS = (events: CalendarEvent[]): string => {
  const eventsICS = events
    .map(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const startICS = formatICSDate(start);
      const endICS = formatICSDate(end);
      const uid = generateEventUID();
      const cleanDescription = cleanDescriptionForICS(event.description);

      return `BEGIN:VEVENT
UID:${uid}
DTSTART:${startICS}
DTEND:${endICS}
SUMMARY:${event.title}
DESCRIPTION:${cleanDescription}
STATUS:CONFIRMED
END:VEVENT`;
    })
    .join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Heating System//Calendar Events//EN
${eventsICS}
END:VCALENDAR`;
};

/**
 * Download ICS file for multiple calendar events
 * @param events - Array of calendar events
 * @param filename - Optional filename (defaults to "calendar_events.ics")
 */
export const downloadMultipleEventsICS = (
  events: CalendarEvent[],
  filename: string = 'calendar_events.ics'
): void => {
  const icsContent = generateMultipleEventsICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
