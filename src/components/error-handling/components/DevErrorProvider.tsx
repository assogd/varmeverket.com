import React, { createContext, useContext, ReactNode } from 'react';
import { ErrorLogger } from './ErrorLogger';
import { DevErrorContextType } from '@/components/error-handling/types';
import { storeError, clearStoredErrors } from '../utils/errorStorage';

const DevErrorContext = createContext<DevErrorContextType | null>(null);

interface DevErrorProviderProps {
  children: ReactNode;
}

export const DevErrorProvider: React.FC<DevErrorProviderProps> = ({
  children,
}) => {
  const logError = (
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName?: string
  ) => {
    if (process.env.NODE_ENV !== 'development') return;
    storeError(error, errorInfo, componentName);
  };

  const clearErrors = () => {
    clearStoredErrors();
  };

  return (
    <DevErrorContext.Provider value={{ logError, clearErrors }}>
      {children}
      <ErrorLogger />
    </DevErrorContext.Provider>
  );
};

export const useDevError = () => {
  const context = useContext(DevErrorContext);
  if (!context) {
    throw new Error('useDevError must be used within a DevErrorProvider');
  }
  return context;
};
