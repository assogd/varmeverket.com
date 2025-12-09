'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { PlusIcon } from '@/components/icons';

interface CustomNumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  required = false,
  placeholder,
  min,
  max,
  step = 1,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(String(value || 0));

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(String(value || 0));
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      if (min !== undefined) finalValue = Math.max(finalValue, min);
      if (max !== undefined) finalValue = Math.min(finalValue, max);
      onChange(finalValue);
    } else if (newValue === '' || newValue === '-') {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(localValue) || 0;
    const newValue = currentValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    handleChange(String(finalValue));
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(localValue) || 0;
    const newValue = currentValue - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    handleChange(String(finalValue));
  };

  const handleBlur = () => {
    // Ensure value is valid on blur
    const numValue = parseFloat(localValue);
    if (isNaN(numValue)) {
      setLocalValue('0');
      onChange(0);
    } else {
      setLocalValue(String(numValue));
    }
    onBlur?.();
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Hidden native input for form submission */}
      <input
        type="number"
        id={id}
        value={value}
        onChange={() => {}} // Controlled by CustomNumberInput
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="sr-only"
        aria-hidden="true"
      />
      <div
        className={clsx(
          'flex items-center border rounded focus-within:border-1 transition-all',
          {
            'border-red-500 focus-within:border-red-500': error,
            'border-text focus-within:border-text': !error,
          }
        )}
      >
        {/* Decrement button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className={clsx(
            'px-5 aspect-square border-r border-text flex items-center justify-center transition-colors font-sans',
            {
              'hover:bg-surface dark:hover:bg-gray-800': !disabled,
              'opacity-50 cursor-not-allowed':
                disabled || (max !== undefined && value >= max),
            }
          )}
          aria-label="Decrease value"
        >
          –
        </button>

        {/* Number input */}
        <input
          type="text"
          inputMode="numeric"
          id={id}
          value={localValue}
          onChange={e => handleChange(e.target.value)}
          onFocus={onFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={clsx(
            'w-full px-4 py-4 bg-bg text-text font-sans focus:outline-none text-center',
            {
              'opacity-50 cursor-not-allowed': disabled,
            }
          )}
        />

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className={clsx(
            'px-5 aspect-square border-l border-text flex items-center justify-center transition-colors font-sans',
            {
              'hover:bg-surface dark:hover:bg-gray-800': !disabled,
              'opacity-50 cursor-not-allowed':
                disabled || (max !== undefined && value >= max),
            }
          )}
          aria-label="Increase value"
        >
          +
        </button>
      </div>
    </div>
  );
};
