import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { CustomDatePicker } from './components/CustomDatePicker';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface DateFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DateField: React.FC<DateFieldProps> = ({
  field,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  const { focused, onFocus, onBlur } = useFieldFocus();
  const fieldId = `field-${field.name}`;

  // Convert value to ISO date string (YYYY-MM-DD)
  const displayValue =
    value && typeof value === 'string'
      ? value
      : value instanceof Date
        ? value.toISOString().split('T')[0]
        : '';

  return (
    <FieldWrapper
      field={field}
      fieldId={fieldId}
      error={error}
      focused={focused}
    >
      <CustomDatePicker
        id={fieldId}
        value={displayValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        error={error}
        required={field.required}
        minYear={field.minYear}
        maxYear={field.maxYear}
      />
    </FieldWrapper>
  );
};
