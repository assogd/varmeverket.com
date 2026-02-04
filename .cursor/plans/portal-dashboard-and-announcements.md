# Portal Dashboard and Announcements

## Overview

Build the member portal dashboard page with an announcement section (managed in Payload) and a calendar-style list view of upcoming bookings/events. The dashboard will display all active announcements sorted by priority.

## High-Level Design

- **Dashboard route**: Use the existing portal dashboard page (`src/app/(frontend)/(portal)/dashboard/page.tsx`) as the main entry. Ensure it uses the shared portal layout and session handling already present in the project.
- **Announcement model in Payload**: Add a new `announcements` collection in Payload with fields for title, rich description, priority, and optional scheduling (publish and expiry dates). We will show all currently active announcements, sorted by priority.
- **Dashboard announcement section**: On page load, the dashboard will fetch all active announcements from a server-side helper or API route and render them in stylized cards similar to the reference banner, sorted by priority.
- **Calendar section**: Reuse your existing booking/event data (e.g. bookings and events collections or APIs) to render a vertical list grouped by day, similar to the reference: each row shows time, title, type badges, and status (booked/saved/etc.).
- **Styling and components**: Reuse portal typography, buttons, and card components from `src/components/ui` and any existing portal components. Use `clsx` and `@` alias imports per your conventions.

## Key Payload Changes

- **New collection `announcements`** (in Payload config, e.g. `[path-to-payload]/collections/Announcements.ts`):
  - **Fields**:
    - `title` (required, text)
    - `content` (rich text or textarea, required)
    - `priority` (select or number, required) - used to sort multiple active announcements
    - `startsAt` / `endsAt` (datetime, optional) to control visibility window
    - `isEnabled` (checkbox) to allow quick on/off.
  - **Access control**: readable by portal users, writable only by admins.
  - **Default sort**: by `priority` desc (higher priority first) so the most important announcements appear at the top.

- **Helper for active announcements** (e.g. `src/lib/announcements.ts`):
  - Server-side function `getActiveAnnouncements()` that queries Payload for `announcements` with conditions:
    - `isEnabled` is true
    - (optional) `startsAt` ≤ now and (`endsAt` is null or `endsAt` ≥ now)
  - Returns an array of all matching announcements, sorted by `priority` descending (higher priority first).
  - Returns empty array if none are active.

## Dashboard Page Changes

- **Data fetching** in `[dashboard]/page.tsx`:
  - Convert/ensure it is a server component that:
    - Uses existing auth/session helper (e.g. `getServerSession` from `src/lib/serverSession.ts`) to get the logged-in user.
    - Calls `getActiveAnnouncements()` to fetch all current active announcements (already sorted by priority).
    - Calls existing booking/event APIs or server functions (e.g. from booking/ calendar modules) to get upcoming items for the next N days.

- **Layout structure** in `dashboard/page.tsx`:
  - **Header**: Large "DASHBOARD" title and subtitle `Meddelanden` using existing typography utilities.
  - **Announcement cards section**:
    - Iterate over all active announcements and render each as a full-width panel with background and border style matching portal theme.
    - Each card displays announcement `title` and `content` (respect site language, likely Swedish as in the reference).
    - Cards are rendered in priority order (highest priority first).
    - If no active announcements, show a small "Inga aktuella meddelanden" state.
  - **Tabs bar** below announcements\*\*:
    - Use a simple tab control or segmented buttons (e.g. `Dashboard`, `Bokningar`, `Inställningar`) matching your existing navigation patterns. For the first iteration, keep these mostly presentational and highlight the current tab.
  - **Calendar section**:
    - Title `Kalender` and short description text.
    - Main content: vertically scrollable area with groups per day (`Idag`, `Imorgon`, and date labels for later days).
    - Under each day group, list upcoming bookings/events as cards:
      - Left: time (e.g. `10:00`).
      - Right: card with event title, small badges for type (e.g. `Evenemang`, `Kurs`, `Bokning`) and status (`Sparad`, `Bokad`, `Anmäld`), plus optional thumbnail image if present on the event.

## Calendar Data Mapping

- **Existing data**: Identify which collections/APIs already expose upcoming events/bookings (e.g. `bookings` and `events` collections or `/api/bookings` endpoints).
- **Mapping function** (e.g. in `src/lib/calendar.ts`):
  - Transform raw bookings/events into a uniform `CalendarItem` shape:
    - `id`, `startsAt`, `title`, `type`, `status`, optional `image`.
  - Group items by date on the server or in a small helper in the dashboard page.

## UI Components to Introduce/Reuse

- **AnnouncementCard** (optional new component in `src/components/portal/dashboard/AnnouncementCard.tsx`):
  - Receives `title`, `content` props.
  - Uses shared card styles from `src/components/ui` and `clsx`.

- **AnnouncementsList** (e.g. in `src/components/portal/dashboard/AnnouncementsList.tsx`):
  - Takes an array of announcements and renders them in order (already sorted by priority from the server).

- **CalendarList / CalendarDaySection** (e.g. in `src/components/portal/dashboard/CalendarList.tsx`):
  - `CalendarList` takes an array of `CalendarItem`s and renders grouped sections.
  - `CalendarDaySection` renders each day label + its list of cards.

- **Styling**:
  - Use Tailwind or existing utility classes to match the dark theme in the screenshot.
  - Ensure responsive behavior: on mobile, full-width cards; on larger screens, centered column similar to the reference.

## Testing and Validation

- **Manual checks**:
  - With multiple active announcements, verify that:
    - All active announcements appear, sorted by priority (highest first).
    - The latest active announcement appears with correct copy and line breaks.
    - Past events are excluded and ordering by time works.
    - Empty states for both announcements and calendar look acceptable.
  - Verify the dashboard respects session/permissions (non-authenticated users redirected or blocked per existing behavior).

- **Future enhancements (optional later)**:
  - Add support for different announcement types (info, warning, maintenance) with subtle visual variations.
  - Allow pinning a specific announcement regardless of date.
  - Add filters in the calendar (e.g. show only my bookings vs. all events).
