'use client';

import React from 'react';
import clsx from 'clsx';

interface LoadingStateProps {
  /** Default: "Laddar..." */
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Laddar...',
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center font-mono',
        'animate-loading-pulse',
        className
      )}
      aria-live="polite"
      aria-busy="true"
    >
      {message}
    </div>
  );
};

export default LoadingState;
