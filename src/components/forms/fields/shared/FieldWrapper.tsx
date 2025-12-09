import React from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldHelpText } from './FieldHelpText';
import { FieldError } from './FieldError';
import type { FormField } from '../../types';

interface FieldWrapperProps {
  field: FormField;
  fieldId: string;
  error?: string;
  focused?: boolean;
  children: React.ReactNode;
  labelPosition?: 'top' | 'left' | 'inline';
  className?: string;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  field,
  fieldId,
  error,
  focused = false,
  children,
  labelPosition = 'top',
  className = '',
}) => {
  const isRequired = field.required ?? false;

  if (labelPosition === 'inline') {
    return (
      <div className={`w-full flex items-start gap-3 ${className}`}>
        {children}
        <div className="flex-1">
          <FieldLabel
            id={fieldId}
            label={field.label}
            required={isRequired}
            error={error}
            focused={focused}
          />
          <FieldHelpText helpText={field.helpText} />
          <FieldError error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <FieldLabel
        id={fieldId}
        label={field.label}
        required={isRequired}
        error={error}
        focused={focused}
      />
      {children}
      <FieldHelpText helpText={field.helpText} />
      <FieldError error={error} />
    </div>
  );
};
