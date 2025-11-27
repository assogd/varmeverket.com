/**
 * Cache performance monitoring utilities
 * Tracks cache hit rates, response times, and performance metrics
 */

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  averageResponseTime: number;
  slowestRequest: number;
}

class CacheMonitor {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    slowestRequest: 0,
  };

  private responseTimes: number[] = [];

  /**
   * Record a cache hit
   */
  recordHit(responseTime: number): void {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.updateResponseTime(responseTime);
  }

  /**
   * Record a cache miss
   */
  recordMiss(responseTime: number): void {
    this.metrics.misses++;
    this.metrics.totalRequests++;
    this.updateResponseTime(responseTime);
  }

  /**
   * Update response time metrics
   */
  private updateResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times for memory efficiency
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    // Update average
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) /
      this.responseTimes.length;

    // Update slowest
    if (responseTime > this.metrics.slowestRequest) {
      this.metrics.slowestRequest = responseTime;
    }
  }

  /**
   * Get current cache hit rate
   */
  getHitRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.hits / this.metrics.totalRequests) * 100;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): CacheMetrics & { hitRate: number } {
    return {
      ...this.metrics,
      hitRate: this.getHitRate(),
    };
  }

  /**
   * Log performance summary (development only)
   */
  logSummary(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const metrics = this.getMetrics();
    console.log('📊 Cache Performance Summary:');
    console.log(`  Hit Rate: ${metrics.hitRate.toFixed(1)}%`);
    console.log(`  Total Requests: ${metrics.totalRequests}`);
    console.log(
      `  Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`
    );
    console.log(`  Slowest Request: ${metrics.slowestRequest}ms`);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: 0,
    };
    this.responseTimes = [];
  }
}

// Global cache monitor instance
export const cacheMonitor = new CacheMonitor();

/**
 * Wrapper for fetch with cache monitoring
 */
export async function monitoredFetch(
  url: string,
  options: RequestInit & { next?: { revalidate?: number } }
): Promise<Response> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;

    // Determine if this was likely a cache hit or miss
    // Cache hits are typically much faster (< 50ms)
    const isCacheHit = responseTime < 50;

    if (isCacheHit) {
      cacheMonitor.recordHit(responseTime);
    } else {
      cacheMonitor.recordMiss(responseTime);
    }

    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🌐 API Call: ${url} - ${isCacheHit ? 'CACHE HIT' : 'CACHE MISS'} (${responseTime}ms)`
      );
    }

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    cacheMonitor.recordMiss(responseTime);
    throw error;
  }
}

/**
 * Global fetch interceptor for comprehensive monitoring
 * This will monitor ALL fetch calls, not just the ones using monitoredFetch
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = Date.now();
    const url = typeof input === 'string' ? input : input.toString();

    try {
      const response = await originalFetch(input, init);
      const responseTime = Date.now() - startTime;

      // Only monitor API calls (not static assets)
      if (
        url.includes('/api/') ||
        url.includes('payload.cms.varmeverket.com')
      ) {
        const isCacheHit = responseTime < 50;

        if (isCacheHit) {
          cacheMonitor.recordHit(responseTime);
        } else {
          cacheMonitor.recordMiss(responseTime);
        }

        console.log(
          `🌐 Global Fetch: ${url} - ${isCacheHit ? 'CACHE HIT' : 'CACHE MISS'} (${responseTime}ms)`
        );
      }

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (
        url.includes('/api/') ||
        url.includes('payload.cms.varmeverket.com')
      ) {
        cacheMonitor.recordMiss(responseTime);
        console.log(
          `🌐 Global Fetch Error: ${url} - CACHE MISS (${responseTime}ms)`
        );
      }

      throw error;
    }
  };
}

/**
 * Get cache performance insights
 */
export function getCacheInsights(): {
  status: 'excellent' | 'good' | 'needs-improvement';
  recommendations: string[];
} {
  const metrics = cacheMonitor.getMetrics();
  const recommendations: string[] = [];

  let status: 'excellent' | 'good' | 'needs-improvement' = 'excellent';

  // Analyze hit rate
  if (metrics.hitRate < 50) {
    status = 'needs-improvement';
    recommendations.push(
      'Consider increasing cache duration or implementing more aggressive caching'
    );
  } else if (metrics.hitRate < 80) {
    status = 'good';
    recommendations.push('Cache performance is good but could be improved');
  }

  // Analyze response times
  if (metrics.averageResponseTime > 1000) {
    status = 'needs-improvement';
    recommendations.push(
      'Response times are slow - consider optimizing API calls or increasing cache duration'
    );
  } else if (metrics.averageResponseTime > 500) {
    if (status === 'excellent') status = 'good';
    recommendations.push('Response times could be improved');
  }

  // Analyze slowest requests
  if (metrics.slowestRequest > 5000) {
    recommendations.push(
      'Some requests are very slow - investigate specific endpoints'
    );
  }

  return { status, recommendations };
}
