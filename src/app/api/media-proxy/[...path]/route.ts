import { NextRequest, NextResponse } from 'next/server';

/**
 * Media Proxy API Route
 *
 * This route proxies media files from the external Payload server.
 * NOTE: With CORS now enabled on the server, 3D models can be fetched directly
 * from assets.varmeverket.com without needing this proxy. This route is kept
 * as a fallback for other use cases or legacy support.
 */

// S3 CDN domain for assets
const S3_CDN_DOMAIN = 'https://assets.varmeverket.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');

    // Construct the S3 CDN URL
    const externalUrl = `${S3_CDN_DOMAIN}/${filePath}`;

    // Fetch the file from the external server
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Varmeverket-Frontend/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch media file' },
        { status: response.status }
      );
    }

    // Get the file content and content type
    const fileBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Media proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
