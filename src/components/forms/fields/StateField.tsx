import React from 'react';
import { TextField } from './TextField';
import type { FormField } from '../types';

interface StateFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * State field - currently uses TextField implementation
 * Can be extended with state-specific logic (e.g., dropdown of US states)
 */
export const StateField: React.FC<StateFieldProps> = props => {
  return <TextField {...props} />;
};
