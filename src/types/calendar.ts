/**
 * Type definitions for calendar-related components and utilities
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  link?: {
    type: 'internal' | 'external';
    reference?: {
      id: string;
      title?: string;
      slug?: string;
      [key: string]: unknown;
    };
    url?: string;
    text?: string;
  };
}

export interface CalendarBlockProps {
  headline?: string;
  description?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  events: CalendarEvent[];
}

export interface CalendarEventCardProps {
  event: CalendarEvent;
  index: number;
  onClick: (event: CalendarEvent) => void;
  isInView?: boolean;
}

export interface CalendarEventOverlayProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}
