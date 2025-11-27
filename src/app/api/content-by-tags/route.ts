import { NextRequest, NextResponse } from 'next/server';
import { getContentByTagsCore } from '@/lib/contentByTags';

/**
 * API route for fetching content by tags with proper server-side filtering
 * This eliminates the need for over-fetching and client-side filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const tagIdsParam = searchParams.get('tagIds');
    const contentTypesParam = searchParams.get('contentTypes');
    const limitParam = searchParams.get('limit');
    const sortParam = searchParams.get('sort');
    const statusParam = searchParams.get('status');

    // Validate and parse parameters
    const tagIds = tagIdsParam ? JSON.parse(tagIdsParam) : [];
    const contentTypes = contentTypesParam
      ? JSON.parse(contentTypesParam)
      : ['articles'];
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const sort = sortParam || '-publishedDate';
    const status = statusParam || 'published';

    if (!Array.isArray(tagIds) || !Array.isArray(contentTypes)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const results = await getContentByTagsCore({
      tagIds,
      contentTypes,
      limit,
      sort,
      status,
    });

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error in content-by-tags API route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        articles: [],
        showcases: [],
        totalCount: 0,
      },
      { status: 500 }
    );
  }
}

