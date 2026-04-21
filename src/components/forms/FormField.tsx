'use client';

import React from 'react';
import type { FormField as FormFieldType } from './types';
import {
  TextField,
  TextareaField,
  EmailField,
  PasswordField,
  TelField,
  UrlField,
  NumberField,
  SelectField,
  CheckboxField,
  StateField,
  CountryField,
  MessageField,
  DateField,
} from './fields';

interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  error?: string;
  onChange: (value: string | number | boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

/**
 * FormField router component
 * Routes to the appropriate field component based on field type
 */
export const FormFieldComponent: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  disabled = false,
}) => {
  // Type-safe onChange handlers
  const handleStringChange = (val: string) => onChange(val);
  const handleNumberChange = (val: number) => onChange(val);
  const handleBooleanChange = (val: boolean) => onChange(val);

  const commonProps = {
    field,
    value,
    error,
    onBlur,
    disabled,
  };

  switch (field.fieldType) {
    case 'textarea':
      return <TextareaField {...commonProps} onChange={handleStringChange} />;

    case 'select':
      return <SelectField {...commonProps} onChange={handleStringChange} />;

    case 'checkbox':
      return <CheckboxField {...commonProps} onChange={handleBooleanChange} />;

    case 'number':
      return <NumberField {...commonProps} onChange={handleNumberChange} />;

    case 'email':
      return <EmailField {...commonProps} onChange={handleStringChange} />;

    case 'password':
      return <PasswordField {...commonProps} onChange={handleStringChange} />;

    case 'tel':
      return <TelField {...commonProps} onChange={handleStringChange} />;

    case 'url':
      return <UrlField {...commonProps} onChange={handleStringChange} />;

    case 'state':
      return <StateField {...commonProps} onChange={handleStringChange} />;

    case 'country':
      return <CountryField {...commonProps} onChange={handleStringChange} />;

    case 'message':
      return <MessageField {...commonProps} onChange={handleStringChange} />;

    case 'date':
      return <DateField {...commonProps} onChange={handleStringChange} />;

    case 'text':
    default:
      return <TextField {...commonProps} onChange={handleStringChange} />;
  }
};
