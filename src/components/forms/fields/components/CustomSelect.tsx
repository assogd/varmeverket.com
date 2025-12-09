'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { AccordionArrowIcon } from '@/components/icons';
import type { FormFieldOption } from '../../types';

interface CustomSelectProps {
  id: string;
  value: string;
  options: FormFieldOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  options,
  placeholder = 'Select an option...',
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      setSearchTerm('');
      onBlur?.();
    }
  };

  return (
    <div ref={selectRef} className={clsx('relative', className)}>
      {/* Hidden native select for form submission */}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom select button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-4 border bg-bg text-text font-sans rounded focus:outline-none focus:border-1 transition-all text-left flex items-center justify-between',
          {
            'border-red-500 focus:border-red-500': error,
            'border-text focus:border-text': !error,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={clsx('truncate', {
            'text-[rgba(0,0,0,.5)] dark:text-[rgba(255,255,255,.5)]':
              !selectedOption,
          })}
        >
          {selectedOption?.label || placeholder}
        </span>
        <AccordionArrowIcon
          size={12}
          className={clsx(
            'ml-2 transition-transform duration-200 flex-shrink-0',
            {
              'rotate-180': isOpen,
            }
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg border border-text rounded shadow-lg max-h-60 overflow-hidden">
          {/* Search input for filtering */}
          {options.length > 5 && (
            <div className="p-2 border-b border-text">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-text bg-bg text-text font-sans rounded text-sm focus:outline-none focus:border-text"
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    'w-full px-4 py-3 text-left font-sans transition-colors hover:bg-surface',
                    {
                      'bg-surface': option.value === value,
                    }
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
