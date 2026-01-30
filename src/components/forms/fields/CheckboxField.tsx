import React from 'react';
import { FieldWrapper } from './shared/FieldWrapper';
import { CustomCheckbox } from './components/CustomCheckbox';
import { useFieldFocus } from './shared/useFieldFocus';
import type { FormField } from '../types';

interface CheckboxFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur: onBlurCallback,
  disabled = false,
}) => {
  const { focused, onFocus, onBlur } = useFieldFocus(onBlurCallback);
  const fieldId = `field-${field.name}`;

  // Ensure checkbox always gets a proper boolean value
  const checkboxValue =
    typeof value === 'boolean'
      ? value
      : field.defaultValue !== undefined
        ? Boolean(field.defaultValue)
        : false;

  return (
    <FieldWrapper
      field={field}
      fieldId={fieldId}
      error={error}
      focused={focused}
      labelPosition="inline"
    >
      <CustomCheckbox
        id={fieldId}
        checked={checkboxValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        error={error}
      />
    </FieldWrapper>
  );
};
