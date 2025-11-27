import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Preview API Route
 *
 * This route handles preview mode activation for draft content.
 * It sets a preview cookie that allows access to draft content.
 */

export async function POST(request: NextRequest) {
  try {
    const { slug, collection, secret } = await request.json();

    // Verify the secret token (required in production)
    const previewSecret = process.env.PREVIEW_SECRET;
    
    // In production, require a secret to be set
    if (process.env.NODE_ENV === 'production' && !previewSecret) {
      console.error('PREVIEW_SECRET is not set in production environment');
      return NextResponse.json(
        { message: 'Preview mode is not configured' },
        { status: 500 }
      );
    }

    // Use a default only in development
    const effectiveSecret = previewSecret || 'your-preview-secret';

    if (secret !== effectiveSecret) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Validate required parameters
    if (!slug || !collection) {
      return NextResponse.json(
        { message: 'Missing required parameters: slug and collection' },
        { status: 400 }
      );
    }

    // Set preview cookie (accessible to JavaScript for UI detection)
    const cookieStore = await cookies();
    cookieStore.set('preview', 'true', {
      httpOnly: false, // Allow JavaScript access for UI detection
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    // Set collection and slug for preview context
    cookieStore.set('preview-collection', collection, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set('preview-slug', slug, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    // Redirect to the preview URL
    const previewUrl = `/${collection}/${slug}?preview=true`;

    return NextResponse.json({
      message: 'Preview mode activated',
      url: previewUrl,
    });
  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear preview cookies
    const cookieStore = await cookies();
    cookieStore.delete('preview');
    cookieStore.delete('preview-collection');
    cookieStore.delete('preview-slug');

    return NextResponse.json({ message: 'Preview mode deactivated' });
  } catch (error) {
    console.error('Preview exit error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
