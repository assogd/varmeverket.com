'use client';

import React from 'react';
import type { FormField as FormFieldType } from './types';
import clsx from 'clsx';

interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  error?: string;
  onChange: (value: string | number | boolean) => void;
  disabled?: boolean;
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  const fieldId = `field-${field.name}`;
  const isRequired = field.required ?? false;

  // Calculate display value with type-aware defaults
  const getDefaultValue = (): string | number | boolean => {
    if (value !== undefined && value !== null) {
      return value as string | number | boolean;
    }
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }
    // Type-aware defaults
    if (field.fieldType === 'checkbox') {
      return false;
    }
    if (field.fieldType === 'number') {
      return 0;
    }
    return '';
  };

  const displayValue = getDefaultValue();

  const baseInputClasses =
    'w-full px-4 py-3 border bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 transition-colors';
  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-text focus:ring-text';

  switch (field.fieldType) {
    case 'textarea':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
            rows={4}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          >
            <option value="">
              {field.placeholder || 'Select an option...'}
            </option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'checkbox':
      // Ensure checkbox always gets a proper boolean value
      const checkboxValue =
        typeof displayValue === 'boolean'
          ? displayValue
          : Boolean(displayValue);
      return (
        <div className="w-full flex items-start gap-3">
          <input
            type="checkbox"
            id={fieldId}
            name={field.name}
            required={isRequired}
            checked={checkboxValue}
            onChange={e => onChange(e.target.checked)}
            disabled={disabled}
            className="mt-1 w-5 h-5 border border-text bg-bg text-text rounded focus:ring-2 focus:ring-text"
          />
          <label htmlFor={fieldId} className="font-mono text-sm flex-1">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as number}
            onChange={e =>
              onChange(
                parseFloat(e.target.value) ||
                  (field.defaultValue as number) ||
                  0
              )
            }
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'email':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="email"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'password':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="password"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'tel':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="tel"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'url':
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="url"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );

    case 'text':
    case 'state':
    case 'country':
    default:
      return (
        <div className="w-full">
          <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            id={fieldId}
            name={field.name}
            required={isRequired}
            value={displayValue as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={clsx(baseInputClasses, errorClasses)}
          />
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {field.helpText}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
          )}
        </div>
      );
  }
};
