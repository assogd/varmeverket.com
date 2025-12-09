'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { AccordionArrowIcon } from '@/components/icons';

interface CustomDatePickerProps {
  id: string;
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

const MONTHS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Mars' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Maj' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Augusti' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  required = false,
  minYear = new Date().getFullYear() - 120, // 120 years ago (reasonable for birth dates)
  maxYear = new Date().getFullYear(), // Current year
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<'day' | 'month' | 'year' | null>(null);
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const lastValueRef = useRef<string>('');

  // Parse initial value
  useEffect(() => {
    if (value && value !== lastValueRef.current) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const parsedDay = String(date.getDate());
          const parsedMonth = String(date.getMonth() + 1);
          const parsedYear = String(date.getFullYear());

          // Only update if values actually changed
          if (day !== parsedDay) setDay(parsedDay);
          if (month !== parsedMonth) setMonth(parsedMonth);
          if (year !== parsedYear) setYear(parsedYear);

          lastValueRef.current = value;
        }
      } catch {
        // Invalid date, reset
        if (day) setDay('');
        if (month) setMonth('');
        if (year) setYear('');
        lastValueRef.current = '';
      }
    } else if (!value && lastValueRef.current) {
      // Value was cleared
      if (day) setDay('');
      if (month) setMonth('');
      if (year) setYear('');
      lastValueRef.current = '';
    }
  }, [value]); // Only depend on value

  // Generate year options
  const yearOptions = useMemo(() => {
    const years: Array<{ value: string; label: string }> = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
  }, [minYear, maxYear]);

  // Generate day options based on month and year
  const dayOptions = useMemo(() => {
    if (!month || !year) return [];

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const days: Array<{ value: string; label: string }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ value: String(d), label: String(d) });
    }
    return days;
  }, [month, year]);

  // Adjust day if it becomes invalid when month/year changes
  useEffect(() => {
    if (!month || !year || !day) return;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const dayNum = parseInt(day);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    if (dayNum > daysInMonth) {
      // Invalid date, adjust day
      setDay(String(daysInMonth));
    }
  }, [month, year]); // Only run when month or year changes

  // Update date when day, month, or year changes
  useEffect(() => {
    // If month or year is cleared, clear day and date
    if (!month || !year) {
      if (day) {
        setDay('');
      }
      if (lastValueRef.current) {
        onChange('');
        lastValueRef.current = '';
      }
      return;
    }

    // If day is not set yet, don't update date
    if (!day) {
      return;
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const dayNum = parseInt(day);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    // Validate date
    if (dayNum > daysInMonth || dayNum < 1) {
      return;
    }

    // All values are valid, create and update date
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
      date.getFullYear() === yearNum &&
      date.getMonth() === monthNum - 1 &&
      date.getDate() === dayNum
    ) {
      const isoString = date.toISOString().split('T')[0];
      // Only call onChange if the date actually changed
      if (lastValueRef.current !== isoString) {
        lastValueRef.current = isoString;
        onChange(isoString);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year]); // onChange intentionally omitted to prevent infinite loop

  const handleSelect = (
    type: 'day' | 'month' | 'year',
    selectedValue: string
  ) => {
    if (type === 'day') setDay(selectedValue);
    if (type === 'month') {
      setMonth(selectedValue);
      // Clear day when month changes (day might become invalid)
      if (day) setDay('');
    }
    if (type === 'year') {
      setYear(selectedValue);
      // Clear month and day when year changes
      if (month) setMonth('');
      if (day) setDay('');
    }
    setIsOpen(null);
    onBlur?.();
  };

  const handleToggle = (type: 'day' | 'month' | 'year') => {
    if (disabled) return;

    // Prevent opening if dependencies aren't met
    if (type === 'month' && !year) return;
    if (type === 'day' && (!month || !year)) return;

    setIsOpen(isOpen === type ? null : type);
    if (isOpen !== type) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-date-picker="${id}"]`)) {
        setIsOpen(null);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, id, onBlur]);

  const getDisplayValue = (type: 'day' | 'month' | 'year'): string => {
    if (type === 'day') return day || 'Dag';
    if (type === 'month') {
      const monthOption = MONTHS.find(m => m.value === month);
      return monthOption ? monthOption.label : 'Månad';
    }
    if (type === 'year') return year || 'År';
    return '';
  };

  const getOptions = (type: 'day' | 'month' | 'year') => {
    if (type === 'day') return dayOptions;
    if (type === 'month') return MONTHS;
    if (type === 'year') return yearOptions;
    return [];
  };

  const renderSelect = (type: 'day' | 'month' | 'year', label: string) => {
    const options = getOptions(type);
    const displayValue = getDisplayValue(type);
    const isDropdownOpen = isOpen === type;
    const isEmpty = type === 'day' ? !day : type === 'month' ? !month : !year;

    // Determine if this select should be disabled
    const isSelectDisabled =
      disabled ||
      (type === 'month' && !year) ||
      (type === 'day' && (!month || !year));

    return (
      <div className="relative flex-1" data-date-picker={id}>
        {/* Hidden native select for form submission */}
        <select
          id={`${id}-${type}`}
          name={`${id}-${type}`}
          value={type === 'day' ? day : type === 'month' ? month : year}
          onChange={() => {}} // Controlled by custom UI
          required={required && !isSelectDisabled}
          disabled={isSelectDisabled}
          className="sr-only"
          aria-hidden="true"
        >
          <option value="">{label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom select button */}
        <button
          type="button"
          onClick={() => handleToggle(type)}
          disabled={isSelectDisabled}
          className={clsx(
            'w-full px-4 py-4 border bg-bg text-text font-sans rounded focus:outline-none focus:border-1 transition-all text-left flex items-center justify-between',
            {
              'border-red-500 focus:border-red-500': error,
              'border-text focus:border-text': !error,
              'opacity-50 cursor-not-allowed': isSelectDisabled,
            }
          )}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span
            className={clsx('truncate', {
              'text-[rgba(0,0,0,.5)] dark:text-[rgba(255,255,255,.5)]': isEmpty,
            })}
          >
            {displayValue}
          </span>
          <AccordionArrowIcon
            size={12}
            className={clsx(
              'ml-2 transition-transform duration-200 flex-shrink-0',
              {
                'rotate-180': isDropdownOpen,
              }
            )}
          />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-bg border border-text rounded shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(type, option.value)}
                className={clsx(
                  'w-full px-4 py-3 text-left font-sans text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                  {
                    'bg-gray-100 dark:bg-gray-800 font-medium':
                      (type === 'day' && option.value === day) ||
                      (type === 'month' && option.value === month) ||
                      (type === 'year' && option.value === year),
                  }
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Hidden native date input for form submission */}
      <input
        type="date"
        id={id}
        name={id}
        value={value}
        onChange={() => {}} // Controlled by custom UI
        required={required}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      />

      <div className="flex gap-2">
        {renderSelect('year', 'År')}
        {renderSelect('month', 'Månad')}
        {renderSelect('day', 'Dag')}
      </div>
    </div>
  );
};
