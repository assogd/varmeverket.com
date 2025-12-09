import React from 'react';
import { TextField } from './TextField';
import type { FormField } from '../types';

interface CountryFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Country field - currently uses TextField implementation
 * Can be extended with country-specific logic (e.g., dropdown of countries)
 */
export const CountryField: React.FC<CountryFieldProps> = props => {
  return <TextField {...props} />;
};
