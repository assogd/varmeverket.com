'use client';

import React, { useState } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings';
import { PayloadAPI } from '@/lib/api';
import clsx from 'clsx';

interface FormField {
  name: string;
  label: string;
  fieldType:
    | 'text'
    | 'textarea'
    | 'email'
    | 'select'
    | 'checkbox'
    | 'number'
    | 'state'
    | 'country'
    | 'message';
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
  width?: number;
}

interface FormData {
  id: string;
  title?: string;
  fields?: FormField[];
  submitButtonLabel?: string;
  confirmationType?: 'message' | 'redirect';
  confirmationMessage?: {
    root: {
      children: Array<unknown>;
    };
  };
  redirect?: {
    type: 'reference' | 'custom';
    reference?: {
      relationTo: string;
      value: string;
    };
    url?: string;
  };
}

interface FormBlockProps {
  form:
    | FormData
    | string
    | { value?: string; id?: string }
    | { id: string; [key: string]: unknown }; // Can be a relationship object or just an ID
}

export const FormBlock: React.FC<FormBlockProps> = ({ form }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Handle different relationship formats from Payload
  let actualForm: FormData | null = null;
  let formId: string | null = null;

  if (typeof form === 'string') {
    formId = form;
  } else if (form && typeof form === 'object') {
    // Check if it's a populated form object
    if ('id' in form && 'fields' in form) {
      actualForm = form as FormData;
      formId = form.id;
    } else if ('value' in form && typeof form.value === 'string') {
      // Relationship format: { value: 'id' }
      formId = form.value;
    } else if ('id' in form) {
      formId = form.id as string;
    }
  }

  // If we don't have form data but have an ID, we'd need to fetch it
  // For now, we'll show an error if form data is missing
  if (!actualForm && formId) {
    console.warn(
      'Form data not populated. Ensure depth is sufficient when fetching the page.'
    );
    return (
      <div className="relative px-4 pt-8 pb-12">
        <DevIndicator componentName="FormBlock" />
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-sm text-red-500">
            Form data not available. Please ensure the form relationship is
            populated.
          </p>
        </div>
      </div>
    );
  }

  if (!actualForm) {
    return null;
  }

  if (!actualForm || !actualForm.fields || actualForm.fields.length === 0) {
    return null;
  }

  const handleInputChange = (
    fieldName: string,
    value: string | number | boolean
  ) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      if (!formId) {
        throw new Error('Form ID is missing');
      }
      await PayloadAPI.submitForm(formId, formValues);

      setSubmitStatus({
        type: 'success',
        message: actualForm.confirmationMessage
          ? 'Form submitted successfully!'
          : 'Form submitted successfully!',
      });

      // Reset form if confirmation type is message
      if (actualForm.confirmationType === 'message') {
        setFormValues({});
      }

      // Handle redirect if needed
      if (actualForm.confirmationType === 'redirect' && actualForm.redirect) {
        if (actualForm.redirect.type === 'custom' && actualForm.redirect.url) {
          window.location.href = actualForm.redirect.url;
        } else if (
          actualForm.redirect.type === 'reference' &&
          actualForm.redirect.reference
        ) {
          // Handle internal redirect based on relationTo
          const { relationTo, value } = actualForm.redirect.reference;
          if (relationTo === 'pages') {
            window.location.href = `/${value}`;
          } else if (relationTo === 'spaces') {
            window.location.href = `/spaces/${value}`;
          } else if (relationTo === 'articles') {
            window.location.href = `/artikel/${value}`;
          }
        }
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to submit form. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.name}`;
    const isRequired = field.required ?? false;
    const value = formValues[field.name] ?? field.defaultValue ?? '';

    switch (field.fieldType) {
      case 'textarea':
        return (
          <div key={field.name} className="w-full">
            <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={fieldId}
              name={field.name}
              required={isRequired}
              value={value as string}
              onChange={e => handleInputChange(field.name, e.target.value)}
              className="w-full px-4 py-3 border border-text bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 focus:ring-text"
              rows={4}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="w-full">
            <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldId}
              name={field.name}
              required={isRequired}
              value={value as string}
              onChange={e => handleInputChange(field.name, e.target.value)}
              className="w-full px-4 py-3 border border-text bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 focus:ring-text"
            >
              <option value="">Select an option...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="w-full flex items-start gap-3">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              required={isRequired}
              checked={value as boolean}
              onChange={e => handleInputChange(field.name, e.target.checked)}
              className="mt-1 w-5 h-5 border border-text bg-bg text-text rounded focus:ring-2 focus:ring-text"
            />
            <label htmlFor={fieldId} className="font-mono text-sm flex-1">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="w-full">
            <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              id={fieldId}
              name={field.name}
              required={isRequired}
              value={value as number}
              onChange={e =>
                handleInputChange(field.name, parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-text bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 focus:ring-text"
            />
          </div>
        );

      case 'email':
        return (
          <div key={field.name} className="w-full">
            <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              id={fieldId}
              name={field.name}
              required={isRequired}
              value={value as string}
              onChange={e => handleInputChange(field.name, e.target.value)}
              className="w-full px-4 py-3 border border-text bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 focus:ring-text"
            />
          </div>
        );

      case 'text':
      case 'state':
      case 'country':
      default:
        return (
          <div key={field.name} className="w-full">
            <label htmlFor={fieldId} className="block mb-2 font-mono text-sm">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              name={field.name}
              required={isRequired}
              value={value as string}
              onChange={e => handleInputChange(field.name, e.target.value)}
              className="w-full px-4 py-3 border border-text bg-bg text-text font-mono rounded focus:outline-none focus:ring-2 focus:ring-text"
            />
          </div>
        );
    }
  };

  return (
    <div className="relative px-4 pt-8 pb-12">
      <DevIndicator componentName="FormBlock" />

      <div className="max-w-2xl mx-auto">
        {actualForm.title && (
          <Heading variant="section" as="h2" className="mb-8 text-center">
            {actualForm.title}
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
            <p className="font-mono text-sm">
              {typeof submitStatus.message === 'string'
                ? submitStatus.message
                : 'Form submitted successfully!'}
            </p>
          </div>
        )}

        {(!submitStatus || submitStatus.type === 'error') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              {actualForm.fields.map(field => renderField(field))}
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
              {isLoading
                ? 'Submitting...'
                : actualForm.submitButtonLabel || 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FormBlock;
