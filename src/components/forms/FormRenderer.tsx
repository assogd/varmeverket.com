'use client';

import React, { useState } from 'react';
import { FormFieldComponent } from './FormField';
import type { FormConfig, FormValues, FormErrors } from './types';
import { validateRequired, validateEmail } from '@/utils/validation';
import { Heading } from '@/components/headings';
import clsx from 'clsx';

interface FormRendererProps {
  config: FormConfig;
  className?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  className,
}) => {
  const [formValues, setFormValues] = useState<FormValues>(() => {
    // Initialize with default values
    const defaults: FormValues = {};
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    return defaults;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const validateField = (fieldName: string, value: unknown): string | null => {
    const field = config.fields.find(f => f.name === fieldName);
    if (!field) return null;

    // Required validation
    if (field.required) {
      const requiredError = validateRequired(value, field.label);
      if (requiredError !== true) {
        return requiredError;
      }
    }

    // Email validation
    if (field.fieldType === 'email' && value) {
      const emailError = validateEmail(value as string);
      if (emailError !== true) {
        return emailError;
      }
    }

    // Custom validation
    if (field.validation && value) {
      const customError = field.validation(value);
      if (customError !== true) {
        return customError;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    config.fields.forEach(field => {
      const error = validateField(field.name, formValues[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (
    fieldName: string,
    value: string | number | boolean
  ) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // If there's a custom onSubmit handler, use it
      if (config.onSubmit) {
        await config.onSubmit(formValues);
      }

      // Call onSuccess callback if provided
      if (config.onSuccess) {
        config.onSuccess(formValues);
      }

      // Show success message if enabled
      if (config.showSuccessMessage !== false) {
        setSubmitStatus({
          type: 'success',
          message: config.successMessage || 'Form submitted successfully!',
        });
      }

      // Reset form if no custom handlers
      if (!config.onSubmit && !config.onSuccess) {
        setFormValues({});
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit form. Please try again.';

      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });

      // Call onError callback if provided
      if (config.onError) {
        config.onError(
          error instanceof Error ? error : new Error(errorMessage)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {config.title && (
        <Heading variant="page-header" as="h1" className="mb-6 text-center">
          {config.title}
        </Heading>
      )}

      {submitStatus && (
        <div
          className={clsx(
            'mb-6 p-4 rounded border',
            submitStatus.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          )}
        >
          <p className="font-mono text-sm">{submitStatus.message}</p>
        </div>
      )}

      {(!submitStatus || submitStatus.type === 'error') && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="grid gap-6">
            {config.fields.map(field => (
              <FormFieldComponent
                key={field.name}
                field={field}
                value={formValues[field.name]}
                error={errors[field.name]}
                onChange={value => handleInputChange(field.name, value)}
                disabled={isLoading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full px-6 py-3 border border-text bg-text text-bg font-mono rounded transition-colors duration-200',
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-opacity-90 active:scale-[0.99]'
            )}
          >
            {isLoading ? 'Submitting...' : config.submitButtonLabel || 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};
