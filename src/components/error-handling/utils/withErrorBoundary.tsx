import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorFallback } from '../components/ErrorFallback';
import { WithErrorBoundaryOptions } from '../types';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const componentName = Component.displayName || Component.name || 'Unknown';

    return (
      <ErrorBoundary
        componentName={componentName}
        onError={options.onError}
        showDevIndicator={options.showDevIndicator}
        fallback={
          options.fallback ? (
            <options.fallback {...props} />
          ) : (
            <ErrorFallback
              error={new Error('Component error')}
              resetError={() => window.location.reload()}
              componentName={componentName}
            />
          )
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Higher-order component for wrapping multiple components
export function withErrorBoundaryProvider<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  return withErrorBoundary(Component, {
    ...options,
    showDevIndicator: true,
  });
}
