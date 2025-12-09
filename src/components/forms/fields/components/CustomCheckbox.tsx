import React from 'react';
import clsx from 'clsx';
import { CheckIcon } from '@/components/icons';

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id,
  checked,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <div className={clsx('relative inline-flex items-center', className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={clsx(
          'relative flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200',
          {
            'bg-bg border-text hover:border-text/80': !checked && !error,
            'bg-text border-text': checked && !error,
            'bg-red-500 border-red-500': error && checked,
            'border-red-500': error && !checked,
            'opacity-50 cursor-not-allowed': disabled,
            'focus-within:ring-2 focus-within:ring-text focus-within:ring-offset-2':
              !disabled,
          }
        )}
      ></label>
    </div>
  );
};
