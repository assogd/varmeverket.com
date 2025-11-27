'use client';

import React, { useState, useEffect } from 'react';
import { cacheMonitor, getCacheInsights } from '@/utils/cacheMonitor';

export function CachePerformance() {
  const [metrics, setMetrics] = useState(cacheMonitor.getMetrics());
  const [insights, setInsights] = useState(getCacheInsights());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(cacheMonitor.getMetrics());
      setInsights(getCacheInsights());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="grow px-2 py-2.5 sm:py-1 rounded-sm hover:bg-white/10 text-bg"
      >
        Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cache Performance
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Performance Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              insights.status === 'excellent'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : insights.status === 'good'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {insights.status.toUpperCase()}
          </span>
        </div>

        {/* Hit Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Hit Rate:
          </span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">
            {metrics.hitRate.toFixed(1)}%
          </span>
        </div>

        {/* Total Requests */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Requests:
          </span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">
            {metrics.totalRequests}
          </span>
        </div>

        {/* Average Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Avg Response:
          </span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">
            {metrics.averageResponseTime.toFixed(0)}ms
          </span>
        </div>

        {/* Slowest Request */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Slowest:
          </span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">
            {metrics.slowestRequest}ms
          </span>
        </div>

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💡 Recommendations:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reset Button */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              cacheMonitor.reset();
              setMetrics(cacheMonitor.getMetrics());
              setInsights(getCacheInsights());
            }}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            🔄 Reset Metrics
          </button>
        </div>
      </div>
    </div>
  );
}
