/**
 * Resolve article author for bylines — handles Payload populated relationship
 * ({ value: { firstName, ... } }) and prefers name over email.
 */

export type AuthorLike =
  | {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      bylineDescription?: string | null;
      /** Payload relationship populated shape */
      value?: AuthorLike;
    }
  | null
  | undefined;

function unwrapAuthor(author: AuthorLike): AuthorLike {
  if (!author || typeof author !== 'object') return author;
  const v = author.value;
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as AuthorLike;
  }
  return author;
}

/**
 * Display name for byline: "First Last" if both, else first or last alone, else email.
 */
export function getAuthorDisplayName(author: AuthorLike): string {
  const a = unwrapAuthor(author);
  if (!a || typeof a !== 'object') return '';

  const first = a.firstName != null ? String(a.firstName).trim() : '';
  const last = a.lastName != null ? String(a.lastName).trim() : '';

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;

  if (a.email != null && String(a.email).trim()) {
    return String(a.email).trim();
  }
  return '';
}

/**
 * Byline description — same unwrap so it works when author is nested under value.
 */
export function getAuthorBylineDescription(
  author: AuthorLike
): string | undefined {
  const a = unwrapAuthor(author);
  if (!a || typeof a !== 'object') return undefined;
  const d = a.bylineDescription;
  if (d == null) return undefined;
  const s = String(d).trim();
  return s || undefined;
}
