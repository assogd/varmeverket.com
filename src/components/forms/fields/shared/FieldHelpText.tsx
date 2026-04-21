import React from 'react';

interface FieldHelpTextProps {
  helpText?: string;
  className?: string;
}

export const FieldHelpText: React.FC<FieldHelpTextProps> = ({
  helpText,
  className = '',
}) => {
  if (!helpText) return null;

  return (
    <p className={`mt-2 mx-1 text-sm font-sans ${className}`}>{helpText}</p>
  );
};
