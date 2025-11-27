import { NextResponse } from 'next/server';
import { cacheMonitor, getCacheInsights } from '@/utils/cacheMonitor';

export async function GET() {
  try {
    const metrics = cacheMonitor.getMetrics();
    const insights = getCacheInsights();

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        insights,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache performance data',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Reset cache metrics
    cacheMonitor.reset();

    return NextResponse.json({
      success: true,
      message: 'Cache metrics reset successfully',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset cache metrics',
      },
      { status: 500 }
    );
  }
}
