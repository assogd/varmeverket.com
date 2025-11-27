export interface ErrorLog {
  error: {
    message: string;
    stack: string;
    name: string;
  };
  errorInfo: {
    componentStack: string;
  };
  timestamp: string;
  errorId: string;
  componentName?: string;
  userAgent: string;
  url: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  componentName?: string;
  showDevIndicator?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  componentName?: string;
  showDetails?: boolean;
}

export interface WithErrorBoundaryOptions {
  fallback?: React.ComponentType<{
    error?: Error;
    resetError?: () => void;
    [key: string]: unknown;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  showDevIndicator?: boolean;
}

export interface DevErrorContextType {
  logError: (
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName?: string
  ) => void;
  clearErrors: () => void;
}
