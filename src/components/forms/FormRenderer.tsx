'use client';

import React, { useState, useMemo } from 'react';
import { FormFieldComponent } from './FormField';
import type { FormConfig, FormValues, FormErrors, FormField } from './types';
import { validateRequired, validateEmail } from '@/utils/validation';
import { Heading } from '@/components/headings';
import { MarqueeButton, Button } from '@/components/ui';
import clsx from 'clsx';

interface FormRendererProps {
  config: FormConfig;
  className?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  className,
}) => {
  // Get all fields from sections or flat fields array (for backward compatibility)
  const allFields = useMemo<FormField[]>(() => {
    if (config.sections) {
      return config.sections.flatMap(section => section.fields);
    }
    return config.fields || [];
  }, [config.sections, config.fields]);

  const [formValues, setFormValues] = useState<FormValues>(() => {
    // Initialize with default values
    const defaults: FormValues = {};
    allFields.forEach(field => {
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
    const field = allFields.find(f => f.name === fieldName);
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

    allFields.forEach(field => {
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
          {config.sections ? (
            // Render with sections
            <div className="space-y-8">
              {config.sections.map((section, sectionIndex) => (
                <div key={section.id || sectionIndex} className="space-y-6">
                  {/* Section header with divider */}
                  <div className="space-y-2">
                    <div className="border-t border-text/20 pt-4">
                      <Heading
                        variant="section"
                        as="h2"
                        className="text-center"
                      >
                        {section.title}
                      </Heading>
                    </div>
                  </div>

                  {/* Section fields */}
                  <div className="grid gap-6">
                    {section.fields.map(field => (
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
                </div>
              ))}
            </div>
          ) : (
            // Render flat fields (backward compatibility)
            <div className="grid gap-6">
              {allFields.map(field => (
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
          )}

          {config.submitButtonVariant === 'marquee' ? (
            <MarqueeButton
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? 'Submitting...'
                : config.submitButtonLabel || 'Submit'}
            </MarqueeButton>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full"
            >
              {isLoading
                ? 'Submitting...'
                : config.submitButtonLabel || 'Submit'}
            </Button>
          )}
        </form>
      )}
    </div>
  );
};
