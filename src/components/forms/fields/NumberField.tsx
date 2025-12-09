import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { CustomNumberInput } from './components/CustomNumberInput';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface NumberFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  const { focused, onFocus, onBlur } = useFieldFocus();
  const fieldId = `field-${field.name}`;
  const displayValue =
    value !== undefined && value !== null
      ? Number(value)
      : Number(field.defaultValue) || 0;

  return (
    <FieldWrapper
      field={field}
      fieldId={fieldId}
      error={error}
      focused={focused}
    >
      <CustomNumberInput
        id={fieldId}
        value={displayValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        error={error}
        required={field.required}
        placeholder={field.placeholder}
        validation={field.validation}
      />
    </FieldWrapper>
  );
};
