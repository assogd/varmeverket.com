import { PayloadAPI } from '@/lib/api';

type EventWithChildren = {
  slug?: string | null;
  children?: Array<string | { id?: string | null }>;
};

let cachedMap: Map<string, string> | null = null;
let cachedAt = 0;
let inFlight: Promise<Map<string, string>> | null = null;

// Parent-child mappings change rarely; keep a longer in-memory TTL to avoid
// repeated full event scans on high-traffic dashboard routes.
const MAP_TTL_MS = 15 * 60 * 1000;

export async function getChildParentSlugMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedMap && now - cachedAt < MAP_TTL_MS) {
    return cachedMap;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const result = await PayloadAPI.find<EventWithChildren>({
      collection: 'events',
      depth: 1,
      limit: 500,
    });

    const map = new Map<string, string>();
    for (const parent of result.docs || []) {
      const parentSlug = parent.slug || undefined;
      if (!parentSlug || !Array.isArray(parent.children)) continue;

      for (const child of parent.children) {
        const childId =
          typeof child === 'string' ? child : child?.id ? String(child.id) : '';
        if (!childId) continue;
        map.set(childId, parentSlug);
      }
    }

    cachedMap = map;
    cachedAt = Date.now();
    inFlight = null;
    return map;
  })().catch(error => {
    inFlight = null;
    throw error;
  });

  return inFlight;
}
