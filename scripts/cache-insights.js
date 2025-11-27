#!/usr/bin/env node

/**
 * Cache Performance Insights CLI
 * Run with: node scripts/cache-insights.js
 */

const fetch = require('node-fetch');

async function getCacheInsights() {
  try {
    const response = await fetch('http://localhost:3000/api/cache-performance');
    const data = await response.json();

    if (!data.success) {
      console.error('❌ Failed to fetch cache insights:', data.error);
      return;
    }

    const { metrics, insights } = data.data;

    console.log('\n📊 CACHE PERFORMANCE INSIGHTS\n');
    console.log('═'.repeat(50));

    // Performance Status
    const statusEmoji = {
      excellent: '🟢',
      good: '🟡',
      'needs-improvement': '🔴',
    };

    console.log(
      `Status: ${statusEmoji[insights.status]} ${insights.status.toUpperCase()}`
    );
    console.log(`Hit Rate: ${metrics.hitRate.toFixed(1)}%`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(
      `Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`
    );
    console.log(`Slowest Request: ${metrics.slowestRequest}ms`);

    // Recommendations
    if (insights.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('─'.repeat(30));
      insights.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Performance Analysis
    console.log('\n📈 ANALYSIS:');
    console.log('─'.repeat(20));

    if (metrics.hitRate >= 80) {
      console.log('✅ Excellent cache hit rate');
    } else if (metrics.hitRate >= 50) {
      console.log('⚠️  Cache hit rate could be improved');
    } else {
      console.log(
        '❌ Poor cache hit rate - consider increasing cache duration'
      );
    }

    if (metrics.averageResponseTime < 500) {
      console.log('✅ Good response times');
    } else if (metrics.averageResponseTime < 1000) {
      console.log('⚠️  Response times could be better');
    } else {
      console.log('❌ Slow response times - investigate API performance');
    }

    if (metrics.slowestRequest > 5000) {
      console.log('⚠️  Some requests are very slow - check specific endpoints');
    }

    console.log('\n' + '═'.repeat(50));
    console.log(
      `Last updated: ${new Date(data.data.timestamp).toLocaleString()}\n`
    );
  } catch (error) {
    console.error('❌ Error fetching cache insights:', error.message);
    console.log('\n💡 Make sure your Next.js app is running on localhost:3000');
  }
}

// Run the insights
getCacheInsights();
