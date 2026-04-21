import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { CustomSelect } from './components/CustomSelect';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface SelectFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
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

  if (!field.options || field.options.length === 0) {
    return null;
  }

  return (
    <FieldWrapper
      field={field}
      fieldId={fieldId}
      error={error}
      focused={focused}
    >
      <CustomSelect
        id={fieldId}
        value={displayValue}
        options={field.options}
        placeholder={field.placeholder || 'Select an option...'}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        error={error}
        required={field.required}
      />
    </FieldWrapper>
  );
};
