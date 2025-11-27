/**
 * Test utility for cache monitoring
 * Use this to verify that cache monitoring is working
 */

import { cacheMonitor } from './cacheMonitor';

export function testCacheMonitor(): void {
  console.log('🧪 Testing Cache Monitor...');

  // Reset metrics first
  cacheMonitor.reset();

  // Simulate some cache hits (fast responses)
  cacheMonitor.recordHit(25);
  cacheMonitor.recordHit(30);
  cacheMonitor.recordHit(20);

  // Simulate some cache misses (slow responses)
  cacheMonitor.recordMiss(500);
  cacheMonitor.recordMiss(800);

  // Get metrics
  const metrics = cacheMonitor.getMetrics();

  console.log('📊 Test Results:');
  console.log(`  Hit Rate: ${metrics.hitRate.toFixed(1)}%`);
  console.log(`  Total Requests: ${metrics.totalRequests}`);
  console.log(
    `  Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`
  );
  console.log(`  Slowest Request: ${metrics.slowestRequest}ms`);

  // Expected results:
  // Hit Rate: 60% (3 hits out of 5 total)
  // Total Requests: 5
  // Average Response Time: ~275ms
  // Slowest Request: 800ms

  if (metrics.hitRate === 60 && metrics.totalRequests === 5) {
    console.log('✅ Cache Monitor is working correctly!');
  } else {
    console.log('❌ Cache Monitor test failed!');
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(testCacheMonitor, 1000);
}
