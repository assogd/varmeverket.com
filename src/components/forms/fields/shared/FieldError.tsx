import React from 'react';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  className = '',
}) => {
  if (!error) return null;

  return (
    <p className={`mt-1 text-xs text-red-500 font-mono ${className}`}>
      {error}
    </p>
  );
};
