'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  validation?: (value: unknown) => true | string;
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
  validation,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(String(value || 0));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentValueRef = useRef<number>(value || 0);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(String(value || 0));
    currentValueRef.current = value || 0;
  }, [value]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const startRapidIncrement = () => {
    if (disabled) return;

    // First increment immediately
    handleIncrement();

    // Then wait a bit before starting rapid increments
    timeoutRef.current = setTimeout(() => {
      // Start rapid increments
      intervalRef.current = setInterval(() => {
        // Use ref to get the latest value (avoids closure issues)
        const currentValue = currentValueRef.current;
        const newValue = currentValue + step;
        const finalValue =
          max !== undefined ? Math.min(newValue, max) : newValue;

        // Stop if we hit max or would be invalid
        if (max !== undefined && finalValue >= max) {
          stopRapidChange();
          return;
        }
        if (wouldBeInvalid(finalValue)) {
          stopRapidChange();
          return;
        }

        handleChange(String(finalValue));
      }, 50); // Rapid increment every 50ms
    }, 300); // Wait 300ms before starting rapid mode
  };

  const startRapidDecrement = () => {
    if (disabled) return;

    // First decrement immediately
    handleDecrement();

    // Then wait a bit before starting rapid decrements
    timeoutRef.current = setTimeout(() => {
      // Start rapid decrements
      intervalRef.current = setInterval(() => {
        // Use ref to get the latest value (avoids closure issues)
        const currentValue = currentValueRef.current;
        const newValue = currentValue - step;
        const finalValue =
          min !== undefined ? Math.max(newValue, min) : newValue;

        // Stop if we hit min or would be invalid
        if (min !== undefined && finalValue <= min) {
          stopRapidChange();
          return;
        }
        if (wouldBeInvalid(finalValue)) {
          stopRapidChange();
          return;
        }

        handleChange(String(finalValue));
      }, 50); // Rapid decrement every 50ms
    }, 300); // Wait 300ms before starting rapid mode
  };

  const stopRapidChange = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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

  // Check if a value would be invalid according to validation
  const wouldBeInvalid = (testValue: number): boolean => {
    if (validation) {
      const result = validation(testValue);
      return result !== true;
    }
    return false;
  };

  // Check if increment would result in invalid value
  const wouldIncrementBeInvalid = (): boolean => {
    const currentValue = parseFloat(localValue) || 0;
    const newValue = currentValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    return wouldBeInvalid(finalValue);
  };

  // Check if decrement would result in invalid value
  const wouldDecrementBeInvalid = (): boolean => {
    const currentValue = parseFloat(localValue) || 0;
    const newValue = currentValue - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    return wouldBeInvalid(finalValue);
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
          onMouseDown={e => {
            e.preventDefault();
            startRapidDecrement();
          }}
          onMouseUp={stopRapidChange}
          onMouseLeave={stopRapidChange}
          onTouchStart={e => {
            e.preventDefault();
            startRapidDecrement();
          }}
          onTouchEnd={stopRapidChange}
          disabled={
            disabled ||
            (min !== undefined && value <= min) ||
            wouldDecrementBeInvalid()
          }
          className={clsx(
            'px-5 aspect-square border-r border-text flex items-center justify-center transition-colors font-sans select-none',
            {
              'hover:bg-surface dark:hover:bg-gray-800':
                !disabled &&
                !(min !== undefined && value <= min) &&
                !wouldDecrementBeInvalid(),
              'opacity-50 cursor-not-allowed':
                disabled ||
                (min !== undefined && value <= min) ||
                wouldDecrementBeInvalid(),
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
          onMouseDown={e => {
            e.preventDefault();
            startRapidIncrement();
          }}
          onMouseUp={stopRapidChange}
          onMouseLeave={stopRapidChange}
          onTouchStart={e => {
            e.preventDefault();
            startRapidIncrement();
          }}
          onTouchEnd={stopRapidChange}
          disabled={
            disabled ||
            (max !== undefined && value >= max) ||
            wouldIncrementBeInvalid()
          }
          className={clsx(
            'px-5 aspect-square border-l border-text flex items-center justify-center transition-colors font-sans select-none',
            {
              'hover:bg-surface dark:hover:bg-gray-800':
                !disabled &&
                !(max !== undefined && value >= max) &&
                !wouldIncrementBeInvalid(),
              'opacity-50 cursor-not-allowed':
                disabled ||
                (max !== undefined && value >= max) ||
                wouldIncrementBeInvalid(),
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
