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
    <p className={`mx-1 mt-2 text-sm text-text font-sans ${className}`}>
      {error}
    </p>
  );
};
