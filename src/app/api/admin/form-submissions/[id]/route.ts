/**
 * Admin API route for a single form submission.
 *
 * GET /api/admin/form-submissions/[id]?form=<formSlug>
 * Proxies GET /v3/forms/<form>/<id> — returns full submission including
 * status_history (needed after PATCH status, which only returns status_message).
 *
 * PATCH — see below.
 * Proxies PATCH /v3/forms/<id> with API key — see API_GUIDE §7.4.
 *
 * PATCH /api/admin/form-submissions/[id]
 * Body (JSON): { archived?: 1 | 0 } | { status: string }
 * - Archive/unarchive: send { archived: 1 } or { archived: 0 } without status.
 * - Status only: send { status: "pending interview" } — must be alone per API.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

function basicAuthHeader(): string {
  const credentials = Buffer.from(
    `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
  ).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * GET full submission by form + id (backend returns status_history here).
 * form must match the submission's form segment (e.g. medlemskap, test-11).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await context.params;
    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid submission id' },
        { status: 400 }
      );
    }

    const form = request.nextUrl.searchParams.get('form')?.trim();
    if (!form) {
      return NextResponse.json(
        {
          error: 'form query required',
          message:
            'GET single submission requires ?form=<slug> (same as submission.form from list)',
        },
        { status: 400 }
      );
    }

    const formSegment = form.replace(/^\/+/, '');
    const url = `${BACKEND_API_URL}/v3/forms/${encodeURIComponent(formSegment)}/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(),
        Accept: 'application/json',
      },
    });

    const responseText = await response.text();
    let data: unknown = { message: response.statusText };
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText || response.statusText };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Backend GET failed',
          message:
            (data as { message?: string })?.message || response.statusText,
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    const list = Array.isArray(data) ? data : [data];
    const submission = list[0] ?? null;
    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error('GET form-submissions/[id] error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await context.params;
    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid submission id' },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const hasStatus =
      typeof body.status === 'string' && body.status.trim() !== '';
    const hasArchived =
      body.archived === 1 || body.archived === 0 || body.archived === '1' || body.archived === '0';

    if (hasStatus && (hasArchived || Object.keys(body).length > 1)) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          message:
            'Status updates must be sent alone. Archive in a separate request.',
        },
        { status: 400 }
      );
    }

    if (!hasStatus && !hasArchived) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          message:
            'Send either { status: "..." } only, or { archived: 1 } / { archived: 0 }',
        },
        { status: 400 }
      );
    }

    const url = `${BACKEND_API_URL}/v3/forms/${id}`;
    const params = new URLSearchParams();
    if (hasStatus) {
      params.set('status', String(body.status).trim());
    } else {
      const archived =
        body.archived === 1 || body.archived === '1' ? '1' : '0';
      params.set('archived', archived);
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    let data: unknown = { message: response.statusText };
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText || response.statusText };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Backend PATCH failed',
          message:
            (data as { message?: string; status_message?: string })
              ?.message ||
            (data as { status_message?: string }).status_message ||
            response.statusText,
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: id,
      data,
    });
  } catch (error) {
    console.error('PATCH form-submissions error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
