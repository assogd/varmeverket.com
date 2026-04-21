/**
 * Shared types + grouping for admin submission lists (SubmissionsList + UsersList).
 */

export interface StatusHistoryEntry {
  id: number;
  submission_id: number;
  status: string;
  note: string | null;
  created_at: string;
}

export interface FormSubmissionLike {
  id: number;
  form: string;
  /** May be missing on some API payloads */
  submission?: Record<string, unknown>;
  user_id?: number | null;
  created_at: string;
  archived?: number;
  status_history?: StatusHistoryEntry[];
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Status…' },
  { value: 'new', label: 'new' },
  { value: 'pending interview', label: 'pending interview' },
  { value: 'pending introduction', label: 'pending introduction' },
  { value: 'accepted', label: 'accepted' },
  { value: 'denied', label: 'denied' },
] as const;

export function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function latestStatus(entry: FormSubmissionLike): string | null {
  const history = entry.status_history;
  if (!history?.length) return null;
  return history[history.length - 1]?.status ?? null;
}

export function statusGroupKey(entry: FormSubmissionLike): string {
  return latestStatus(entry) ?? 'No status';
}

const GROUP_ORDER = [
  'new',
  'pending interview',
  'pending introduction',
  'accepted',
  'denied',
  'No status',
] as const;

export function groupSubmissions(
  list: FormSubmissionLike[]
): { key: string; items: FormSubmissionLike[] }[] {
  const map = new Map<string, FormSubmissionLike[]>();
  for (const sub of list) {
    const key = statusGroupKey(sub);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(sub);
  }
  const keys = Array.from(map.keys());
  keys.sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a as (typeof GROUP_ORDER)[number]);
    const ib = GROUP_ORDER.indexOf(b as (typeof GROUP_ORDER)[number]);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
  return keys.map(key => ({ key, items: map.get(key)! }));
}

/** Normalize submission payload — API may omit or nest */
export function submissionPayload(
  sub: FormSubmissionLike | { submission?: unknown }
): Record<string, unknown> {
  const s = (sub as { submission?: unknown }).submission;
  if (s && typeof s === 'object' && !Array.isArray(s)) {
    return s as Record<string, unknown>;
  }
  return {};
}
