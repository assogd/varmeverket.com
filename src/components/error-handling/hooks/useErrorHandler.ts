import { useCallback } from 'react';
import { storeError } from '../utils/errorStorage';

export const useErrorHandler = () => {
  const handleError = useCallback(
    (error: Error, errorInfo: React.ErrorInfo, componentName?: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Handler');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component:', componentName);
        console.groupEnd();

        storeError(error, errorInfo, componentName);
      }
    },
    []
  );

  const handleAsyncError = useCallback(
    (error: Error, componentName?: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Async Error Handler');
        console.error('Error:', error);
        console.error('Component:', componentName);
        console.groupEnd();

        // Create a mock errorInfo for async errors
        const errorInfo: React.ErrorInfo = {
          componentStack: 'Async error - no component stack available',
        };

        storeError(error, errorInfo, componentName);
      }
    },
    []
  );

  return {
    handleError,
    handleAsyncError,
  };
};
