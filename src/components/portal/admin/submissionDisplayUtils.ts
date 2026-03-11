/**
 * Shared helpers for rendering form submission payloads (admin submissions + users).
 */

export function submissionEntries(data: Record<string, unknown>) {
  return Object.entries(data).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
}

export function formatSubmissionValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
