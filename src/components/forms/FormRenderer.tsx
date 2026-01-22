'use client';

import React, { useState, useMemo } from 'react';
import { FormFieldComponent } from './FormField';
import type {
  FormConfig,
  FormValues,
  FormErrors,
  FormField,
  FormSection,
  FormContentBlock,
  FormFieldBlock,
  FormSectionBlock,
} from './types';
import { validateRequired, validateEmail } from '@/utils/validation';
import { Heading } from '@/components/headings';
import { SectionFrame } from '@/components/layout/SectionFrame';
import { MarqueeButton, Button } from '@/components/ui';
import clsx from 'clsx';

interface FormRendererProps {
  config: FormConfig;
  className?: string;
  customFirstField?: React.ReactNode; // Custom component to inject as first field in first section
}

// Map block types to field types
const blockTypeToFieldType = (
  blockType: string
): FormField['fieldType'] | null => {
  const mapping: Record<string, FormField['fieldType']> = {
    formFieldText: 'text',
    formFieldTextarea: 'textarea',
    formFieldEmail: 'email',
    formFieldSelect: 'select',
    formFieldCheckbox: 'checkbox',
    formFieldNumber: 'number',
    formFieldState: 'state',
    formFieldCountry: 'country',
    formFieldTel: 'tel',
    formFieldUrl: 'url',
    formFieldDate: 'date',
    formFieldMessage: 'message',
  };
  return mapping[blockType] || null;
};

// Convert form field block to FormField
const convertFormFieldBlockToFormField = (
  block: FormFieldBlock
): FormField | null => {
  const fieldType = blockTypeToFieldType(block.blockType);
  if (!fieldType) {
    console.warn(`Unknown form field block type: ${block.blockType}`);
    return null;
  }

  return {
    name: block.name,
    label: block.label,
    fieldType,
    required: block.required,
    defaultValue: block.defaultValue,
    placeholder: block.placeholder,
    helpText: block.helpText,
    options: block.options,
    minYear: block.minYear,
    maxYear: block.maxYear,
    inputMode: block.inputMode,
    pattern: block.pattern,
    maxLength: block.maxLength,
  };
};

// Convert form section block to FormSection
const convertFormSectionBlockToFormSection = (
  block: FormSectionBlock
): FormSection | null => {
  if (block.blockType !== 'formSection') {
    return null;
  }

  const fields: FormField[] = [];
  if (block.fields && Array.isArray(block.fields)) {
    for (const fieldBlock of block.fields) {
      const converted = convertFormFieldBlockToFormField(
        fieldBlock as FormFieldBlock
      );
      if (converted) {
        fields.push(converted);
      }
    }
  }

  return {
    title: block.title,
    fields,
  };
};

// Convert blocks array to sections/fields
const convertBlocksToSectionsAndFields = (
  blocks: FormContentBlock[]
): { fields?: FormField[]; sections?: FormSection[] } => {
  const fields: FormField[] = [];
  const sections: FormSection[] = [];

  for (const block of blocks) {
    if (block.blockType === 'formSection') {
      const section = convertFormSectionBlockToFormSection(
        block as FormSectionBlock
      );
      if (section) {
        sections.push(section);
      }
    } else {
      // It's a form field block
      const field = convertFormFieldBlockToFormField(block as FormFieldBlock);
      if (field) {
        fields.push(field);
      }
    }
  }

  // If we have sections, return sections (they take priority)
  // Otherwise, return flat fields
  if (sections.length > 0) {
    return { sections };
  }
  return { fields };
};

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  className,
  customFirstField,
}) => {
  // Convert blocks to sections/fields if content is provided
  const convertedConfig = useMemo(() => {
    if (config.content && config.content.length > 0) {
      const converted = convertBlocksToSectionsAndFields(config.content);
      return {
        ...config,
        ...converted,
        customFirstField,
      };
    }
    return { ...config, customFirstField };
  }, [config, customFirstField]);

  // Get all fields from sections or flat fields array (for backward compatibility)
  const allFields = useMemo<FormField[]>(() => {
    if (convertedConfig.sections) {
      return convertedConfig.sections.flatMap(section => section.fields);
    }
    return convertedConfig.fields || [];
  }, [convertedConfig.sections, convertedConfig.fields]);

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

    const fieldError = validateField(fieldName, value);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    } else if (errors[fieldName]) {
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
      if (convertedConfig.onSubmit) {
        await convertedConfig.onSubmit(formValues);
      }

      // Call onSuccess callback if provided
      if (convertedConfig.onSuccess) {
        convertedConfig.onSuccess(formValues);
      }

      // Show success message if enabled
      if (convertedConfig.showSuccessMessage !== false) {
        setSubmitStatus({
          type: 'success',
          message:
            convertedConfig.successMessage || 'Form submitted successfully!',
        });
      }

      // Reset form if no custom handlers
      if (!convertedConfig.onSubmit && !convertedConfig.onSuccess) {
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
      if (convertedConfig.onError) {
        convertedConfig.onError(
          error instanceof Error ? error : new Error(errorMessage)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {convertedConfig.title && (
        <Heading variant="page-header" as="h1" className="mb-6 text-center">
          {convertedConfig.title}
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
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {convertedConfig.sections ? (
            // Render with sections
            <div className="space-y-8">
              {convertedConfig.sections.map((section, sectionIndex) => {
                const title = section.title?.trim();
                return (
                  <SectionFrame
                    key={section.id || sectionIndex}
                    title={
                      title ? (
                        <Heading
                          variant="section"
                          as="h2"
                          className="text-center"
                        >
                          {section.title}
                        </Heading>
                      ) : undefined
                    }
                  >
                    <div className="grid gap-8">
                      {/* Inject custom first field if provided and this is the first section */}
                      {sectionIndex === 0 &&
                        convertedConfig.customFirstField && (
                          <div>{convertedConfig.customFirstField}</div>
                        )}
                      {section.fields.map(field => (
                        <FormFieldComponent
                          key={field.name}
                          field={field}
                          value={formValues[field.name]}
                          error={errors[field.name]}
                          onChange={value =>
                            handleInputChange(field.name, value)
                          }
                          disabled={isLoading}
                        />
                      ))}
                    </div>

                    {/* Submit button - only show for the last section */}
                    {convertedConfig.sections &&
                      sectionIndex === convertedConfig.sections.length - 1 && (
                        <div className="mt-10">
                          {convertedConfig.submitButtonVariant === 'marquee' ? (
                            <MarqueeButton
                              type="submit"
                              disabled={isLoading}
                              className="w-full"
                            >
                              {isLoading
                                ? 'Submitting...'
                                : convertedConfig.submitButtonLabel || 'Submit'}
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
                                : convertedConfig.submitButtonLabel || 'Submit'}
                            </Button>
                          )}
                        </div>
                      )}
                  </SectionFrame>
                );
              })}
            </div>
          ) : (
            // Render flat fields (backward compatibility)
            <div className="max-w-2xl mx-auto border-r border-l border-text p-12">
              <div className="grid gap-6">
                {(convertedConfig.fields || allFields).map(field => (
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
              <div className="mt-6">
                {convertedConfig.submitButtonVariant === 'marquee' ? (
                  <MarqueeButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading
                      ? 'Submitting...'
                      : convertedConfig.submitButtonLabel || 'Submit'}
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
                      : convertedConfig.submitButtonLabel || 'Submit'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
