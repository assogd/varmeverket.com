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
  /** When set, the card renders as a link instead of opening the overlay. */
  href?: string;
  /** When true, the card represents the current/active event and is visually disabled. */
  isActive?: boolean;
}

export interface CalendarEventOverlayProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

