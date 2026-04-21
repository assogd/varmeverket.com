/**
 * Admin API route: list form slugs from Payload CMS (forms collection).
 * Merged with JSON form slugs on the client for a single submissions dropdown.
 *
 * GET /api/admin/form-slugs
 *
 * Uses the same env gate as form-submissions (API key must be configured)
 * so this route is only usable in environments where admin tooling is set up.
 *
 * If the backend later exposes GET /v3/forms listing distinct form keys, this
 * route could merge those too for admin-only buckets without a CMS entry.
 */

import { NextRequest, NextResponse } from 'next/server';
import PayloadAPI from '@/lib/api';
import { requireAdminApiAccess } from '@/lib/adminApiAuth';
import { getFormSlugs } from '@/lib/loadFormFromJson';

const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

export interface FormSlugOption {
  value: string;
  label: string;
  source: 'payload' | 'json';
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess(request);
    if (!access.ok) return access.response;

    if (!API_KEY_USERNAME || !API_KEY_PASSWORD) {
      return NextResponse.json(
        {
          error: 'API key not configured',
          message:
            'BACKEND_API_KEY_USERNAME and BACKEND_API_KEY_PASSWORD must be set',
        },
        { status: 500 }
      );
    }

    // JSON forms (repo) — always include
    const jsonSlugs = getFormSlugs();
    const jsonOptions: FormSlugOption[] = jsonSlugs.map(slug => ({
      value: slug,
      label: `${slug} (JSON)`,
      source: 'json' as const,
    }));

    // Payload forms — slug + title from CMS
    const payloadOptions: FormSlugOption[] = [];
    try {
      const result = await PayloadAPI.find<{
        id: string;
        slug?: string;
        title?: string;
      }>({
        collection: 'forms',
        limit: 500,
        depth: 0,
        sort: 'title',
      });

      const seen = new Set<string>();
      for (const doc of result.docs || []) {
        const slug = doc.slug || doc.id;
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        const title = doc.title || slug;
        payloadOptions.push({
          value: slug,
          label: `${slug} — ${title} (CMS)`,
          source: 'payload',
        });
      }
    } catch (e) {
      console.error('❌ Failed to fetch Payload forms for form-slugs:', e);
      // Still return JSON slugs so admin works without CMS
    }

    // Merge: JSON first, then Payload; dedupe by value (JSON wins if same slug)
    const byValue = new Map<string, FormSlugOption>();
    for (const opt of [...jsonOptions, ...payloadOptions]) {
      if (!byValue.has(opt.value)) {
        byValue.set(opt.value, opt);
      }
    }
    const slugs = Array.from(byValue.values()).sort((a, b) =>
      a.value.localeCompare(b.value)
    );

    return NextResponse.json({
      success: true,
      slugs,
    });
  } catch (error) {
    console.error('❌ Error in form-slugs route:', error);
    return NextResponse.json(
      {
        error: 'Failed to list form slugs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
