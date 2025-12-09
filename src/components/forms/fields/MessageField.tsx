import React from 'react';
import { TextareaField } from './TextareaField';
import type { FormField } from '../types';

interface MessageFieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Message field - uses TextareaField implementation
 * Can be extended with message-specific logic if needed
 */
export const MessageField: React.FC<MessageFieldProps> = props => {
  return <TextareaField {...props} />;
};
