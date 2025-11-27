import { ErrorLog } from '../types';

const STORAGE_KEY = 'dev-errors';
const MAX_ERRORS = 10;

export const storeError = (
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
): string => {
  const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const errorData: ErrorLog = {
    error: {
      message: error.message,
      stack: error.stack || '',
      name: error.name,
    },
    errorInfo: {
      componentStack: errorInfo.componentStack,
    },
    timestamp: new Date().toISOString(),
    errorId,
    componentName,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  try {
    const existingErrors = getStoredErrors();
    existingErrors.unshift(errorData);
    const recentErrors = existingErrors.slice(0, MAX_ERRORS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentErrors));
  } catch (e) {
    console.warn('Failed to store error for debugging:', e);
  }

  return errorId;
};

export const getStoredErrors = (): ErrorLog[] => {
  try {
    const storedErrors = localStorage.getItem(STORAGE_KEY);
    return storedErrors ? JSON.parse(storedErrors) : [];
  } catch (e) {
    console.warn('Failed to load error logs:', e);
    return [];
  }
};

export const clearStoredErrors = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear error logs:', e);
  }
};

export const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
