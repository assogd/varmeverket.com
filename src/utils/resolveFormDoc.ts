import { PayloadAPI } from '@/lib/api';

/**
 * Form may be already populated from REST (depth) or be a bare id / { value }.
 * Return a full form document when possible so FormBlock can render.
 */
export async function resolveFormDoc(
  form: unknown
): Promise<Record<string, unknown> | null> {
  if (form == null) return null;

  if (typeof form === 'object' && form !== null) {
    const o = form as Record<string, unknown>;
    const content = o.content;
    const hasBlocks = Array.isArray(content) && content.length > 0;
    const hasLegacy =
      (Array.isArray(o.fields) && o.fields.length > 0) ||
      (Array.isArray(o.sections) && o.sections.length > 0);
    if (typeof o.id === 'string' && (hasBlocks || hasLegacy)) {
      return o;
    }
  }

  const asString = (v: unknown): string | null =>
    v == null ? null : typeof v === 'string' ? v : String(v);

  let slug: string | null = null;
  let id: string | null = null;

  if (typeof form === 'string' || typeof form === 'number') {
    id = asString(form);
  } else if (typeof form === 'object' && form !== null) {
    const o = form as Record<string, unknown>;
    if (typeof o.slug === 'string' && o.slug.length > 0) {
      slug = o.slug;
    }
    const rawId =
      asString(o.value) ??
      asString(o.id) ??
      (typeof o._id === 'string' ? o._id : null);
    if (rawId) id = rawId;
  }

  // Prefer slug: use findBySlug (flattened where[slug][equals]) so the server
  // actually filters; find() with JSON where can be ignored and return docs[0].
  if (slug) {
    try {
      const doc = await PayloadAPI.findBySlug<Record<string, unknown>>(
        'forms',
        slug,
        5,
        false
      );
      if (doc && typeof doc === 'object') return doc;
    } catch {
      /* fall through */
    }
  }

  if (id) {
    try {
      const doc = await PayloadAPI.findByID<Record<string, unknown>>(
        'forms',
        id,
        5
      );
      if (doc && typeof doc === 'object') return doc;
    } catch {
      /* ignore */
    }
  }

  return null;
}
