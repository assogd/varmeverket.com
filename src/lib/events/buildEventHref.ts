type EventHrefInput = {
  slug?: string | null;
  startDateTime?: string | null;
};

export function buildEventHref(
  event: EventHrefInput,
  parentSlug?: string
): string | undefined {
  if (!event.slug) return undefined;
  if (!parentSlug || !event.startDateTime) return `/evenemang/${event.slug}`;

  const date = new Date(event.startDateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `/evenemang/${parentSlug}/${year}/${month}/${day}/${event.slug}`;
}
