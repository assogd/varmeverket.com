/**
 * Admin API route to fetch form submissions
 * Uses server-side API key authentication
 *
 * GET /api/admin/form-submissions?formSlug=<slug>
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

// API key credentials (should be in environment variables)
const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!API_KEY_USERNAME || !API_KEY_PASSWORD) {
      console.error('❌ API key not configured');
      return NextResponse.json(
        {
          error: 'API key not configured',
          message:
            'BACKEND_API_KEY_USERNAME and BACKEND_API_KEY_PASSWORD must be set in environment variables',
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const formSlug = searchParams.get('formSlug');
    const includeArchived = searchParams.get('archived') === '1';

    if (!formSlug) {
      return NextResponse.json(
        { error: 'formSlug parameter is required' },
        { status: 400 }
      );
    }

    const baseUrl = `${BACKEND_API_URL}/v3/forms/${formSlug}`;
    const urlActive = baseUrl;
    const urlArchivedOnly = `${baseUrl}?archived=1`;

    // Create HTTP Basic Auth header
    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${credentials}`,
      Accept: 'application/json' as const,
    };

    /**
     * Backend GET without ?archived=1 returns non-archived only.
     * GET with ?archived=1 returns archived only (not "all").
     * To show both, we fetch both and merge by submission id.
     */
    async function fetchSubmissionsList(
      url: string
    ): Promise<{ ok: true; list: unknown[] } | { ok: false; response: NextResponse }> {
      const response = await fetch(url, { method: 'GET', headers });
      const responseText = await response.text();
      let errorData: unknown = { message: response.statusText };
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || response.statusText };
      }
      if (!response.ok) {
        console.error('❌ Backend API error:', {
          status: response.status,
          url,
          error: errorData,
        });
        return {
          ok: false,
          response: NextResponse.json(
            {
              error: 'Failed to fetch form submissions',
              message:
                (errorData as { message?: string })?.message ||
                response.statusText ||
                'Unknown error',
              status: response.status,
              details: errorData,
            },
            { status: response.status }
          ),
        };
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = responseText;
      }
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return { ok: true, list };
    }

    if (!includeArchived) {
      const result = await fetchSubmissionsList(urlActive);
      if (!result.ok) return result.response;
      const submissions = result.list;
      console.log('✅ Form submissions fetched:', {
        formSlug,
        count: submissions.length,
      });
      return NextResponse.json({
        success: true,
        formSlug,
        submissions,
        count: submissions.length,
      });
    }

    // Include archived: merge active + archived-only lists
    const [activeResult, archivedResult] = await Promise.all([
      fetchSubmissionsList(urlActive),
      fetchSubmissionsList(urlArchivedOnly),
    ]);
    if (!activeResult.ok) return activeResult.response;
    if (!archivedResult.ok) return archivedResult.response;

    const byId = new Map<number, unknown>();
    for (const item of activeResult.list) {
      const id = (item as { id?: number })?.id;
      if (typeof id === 'number') byId.set(id, item);
    }
    for (const item of archivedResult.list) {
      const id = (item as { id?: number })?.id;
      if (typeof id === 'number' && !byId.has(id)) byId.set(id, item);
    }
    const merged = Array.from(byId.values());
    merged.sort((a, b) => {
      const ta = new Date(
        (a as { created_at?: string })?.created_at ?? 0
      ).getTime();
      const tb = new Date(
        (b as { created_at?: string })?.created_at ?? 0
      ).getTime();
      return tb - ta;
    });

    console.log('✅ Form submissions fetched (merged active + archived):', {
      formSlug,
      count: merged.length,
    });
    return NextResponse.json({
      success: true,
      formSlug,
      submissions: merged,
      count: merged.length,
    });
  } catch (error) {
    console.error('❌ Error fetching form submissions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch form submissions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
