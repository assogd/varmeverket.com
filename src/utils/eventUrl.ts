export interface EventUrlInput {
  slug?: string | null;
  startDateTime?: string | null;
  parentSlug?: string | null;
  href?: string | null;
}

export function buildEventUrl(event: EventUrlInput): string {
  if (event.href && event.href.trim()) return event.href;

  const slug = event.slug?.trim();
  if (!slug) return '#';

  const parentSlug = event.parentSlug?.trim();
  const startDateTime = event.startDateTime;

  if (!parentSlug || !startDateTime) {
    return `/evenemang/${slug}`;
  }

  const date = new Date(startDateTime);
  if (Number.isNaN(date.getTime())) {
    return `/evenemang/${slug}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `/evenemang/${parentSlug}/${year}/${month}/${day}/${slug}`;
}

