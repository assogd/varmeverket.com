import React, { Component } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from '@/components/error-handling/types';
import { storeError, generateErrorId } from '../utils/errorStorage';

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();

      // Store error for debugging
      storeError(error, errorInfo, this.props.componentName);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo, this.state.errorId);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleCopyError = () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      console.log('Error details copied to clipboard');
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return (
          <>
            {this.props.fallback}
            {this.props.showDevIndicator && (
              <DevIndicator
                componentName={`ErrorBoundary: ${this.props.componentName || 'Unknown'}`}
                position="top-right"
              />
            )}
          </>
        );
      }

      // Default error UI for development
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="relative">
            <DevIndicator
              componentName={`ErrorBoundary: ${this.props.componentName || 'Unknown'}`}
              position="top-right"
            />
            <div className="border-2 border-red-500 bg-red-50 p-4 m-2 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-red-800">
                  🚨 Component Error
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={this.handleRetry}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Retry
                  </button>
                  <button
                    onClick={this.handleCopyError}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Copy Error
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Error:</strong> {this.state.error?.message}
                </div>
                <div>
                  <strong>Component:</strong>{' '}
                  {this.props.componentName || 'Unknown'}
                </div>
                <div>
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>

                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-red-700">
                      Stack Trace
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-red-700">
                      Component Stack
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Production fallback
      return (
        <div className="p-4 text-center text-gray-600">
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
