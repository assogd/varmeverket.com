// Main exports for error handling system
export { ErrorBoundary } from './components/ErrorBoundary';
export { ErrorFallback } from './components/ErrorFallback';
export { ErrorLogger } from './components/ErrorLogger';
export { DevErrorProvider, useDevError } from './components/DevErrorProvider';

// HOCs and utilities
export {
  withErrorBoundary,
  withErrorBoundaryProvider,
} from './utils/withErrorBoundary';
export { useErrorHandler } from './hooks/useErrorHandler';

// Types
export type {
  ErrorLog,
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorFallbackProps,
  WithErrorBoundaryOptions,
  DevErrorContextType,
} from './types';

// Utilities
export {
  storeError,
  getStoredErrors,
  clearStoredErrors,
  generateErrorId,
} from './utils/errorStorage';
