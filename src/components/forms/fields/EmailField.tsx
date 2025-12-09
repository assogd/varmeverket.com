import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { getInputClasses } from './shared/inputStyles';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface EmailFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  field,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  const { focused, onFocus, onBlur } = useFieldFocus();
  const fieldId = `field-${field.name}`;
  const displayValue =
    (value !== undefined && value !== null ? String(value) : '') ||
    String(field.defaultValue || '');

  return (
    <FieldWrapper
      field={field}
      fieldId={fieldId}
      error={error}
      focused={focused}
    >
      <input
        type="email"
        id={fieldId}
        name={field.name}
        required={field.required}
        value={displayValue}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={disabled}
        className={getInputClasses(error)}
      />
    </FieldWrapper>
  );
};
