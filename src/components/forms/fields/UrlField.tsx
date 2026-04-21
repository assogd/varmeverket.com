import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { getInputClasses } from './shared/inputStyles';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface UrlFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const UrlField: React.FC<UrlFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur: onBlurCallback,
  disabled = false,
}) => {
  const { focused, onFocus, onBlur } = useFieldFocus(onBlurCallback);
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
        type="url"
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
