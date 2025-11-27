'use client';
import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { ErrorFallbackProps } from '@/components/error-handling/types';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  componentName,
  showDetails = true,
}) => {
  const [showStack, setShowStack] = React.useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-4 text-center text-gray-600 bg-gray-50 rounded-lg">
        <p className="mb-2">Something went wrong with this component.</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <DevIndicator
        componentName={`ErrorFallback: ${componentName || 'Unknown'}`}
        position="top-left"
      />

      <div className="border-2 border-orange-400 bg-orange-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
            <span>⚠️</span>
            Component Error
          </h3>
          <div className="flex gap-2">
            <button
              onClick={resetError}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setShowStack(!showStack)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {showStack ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <strong className="text-orange-800">Error:</strong>
            <span className="ml-2 text-orange-700">{error.message}</span>
          </div>

          {componentName && (
            <div>
              <strong className="text-orange-800">Component:</strong>
              <span className="ml-2 text-orange-700">{componentName}</span>
            </div>
          )}

          {showDetails && showStack && (
            <div className="mt-3">
              <details open>
                <summary className="cursor-pointer font-medium text-orange-800 mb-2">
                  Stack Trace
                </summary>
                <pre className="p-3 bg-white rounded border text-xs overflow-auto max-h-40 text-gray-700">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}

          <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
            <strong>💡 Tip:</strong> Check the browser console for more details.
            This error has been logged for debugging.
          </div>
        </div>
      </div>
    </div>
  );
};
