'use client';
import React, { useState, useEffect } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { ErrorLog } from '@/components/error-handling/types';
import { getStoredErrors, clearStoredErrors } from '../utils/errorStorage';

export const ErrorLogger: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setErrors(getStoredErrors());
  }, []);

  const clearErrors = () => {
    clearStoredErrors();
    setErrors([]);
  };

  const copyError = (error: ErrorLog) => {
    const errorText = `
Error: ${error.error.message}
Stack: ${error.error.stack}
Component Stack: ${error.errorInfo.componentStack}
Error ID: ${error.errorId}
Timestamp: ${error.timestamp}
Component: ${error.componentName || 'Unknown'}
URL: ${error.url}
    `.trim();

    navigator.clipboard.writeText(errorText);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DevIndicator componentName="ErrorLogger" position="top-left" />

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mb-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          errors.length > 0
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-500 text-white hover:bg-gray-600'
        }`}
      >
        🚨 Errors ({errors.length})
      </button>

      {/* Error Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Error Log</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearErrors}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {errors.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No errors logged yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {errors.map(error => (
                  <div key={error.errorId} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">
                          {error.componentName || 'Unknown Component'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => copyError(error)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="text-sm text-red-700 mb-2">
                      {error.error.message}
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Show Stack Trace
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-20">
                        {error.error.stack}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
