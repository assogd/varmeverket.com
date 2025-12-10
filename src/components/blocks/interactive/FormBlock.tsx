'use client';

import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings';
import { PayloadAPI } from '@/lib/api';
import { FormRenderer } from '@/components/forms';
import type { FormConfig, FormField, FormSection } from '@/components/forms';
import clsx from 'clsx';

interface CMSFormField {
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
    | 'message'
    | 'date';
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
  width?: number;
  placeholder?: string;
  helpText?: string;
}

interface CMSFormSection {
  id?: string;
  title: string;
  fields?: CMSFormField[];
}

interface CMSFormData {
  id: string;
  title?: string;
  fields?: CMSFormField[];
  sections?: CMSFormSection[];
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
    | CMSFormData
    | string
    | { value?: string; id?: string }
    | { id: string; [key: string]: unknown };
}

// Convert CMS form field to FormRenderer field
const convertCMSFieldToFormField = (cmsField: CMSFormField): FormField => ({
  name: cmsField.name,
  label: cmsField.label,
  fieldType: cmsField.fieldType as FormField['fieldType'],
  required: cmsField.required,
  defaultValue: cmsField.defaultValue,
  options: cmsField.options,
  placeholder: cmsField.placeholder,
  helpText: cmsField.helpText,
});

// Convert CMS form section to FormRenderer section
const convertCMSSectionToFormSection = (
  cmsSection: CMSFormSection
): FormSection => ({
  id: cmsSection.id,
  title: cmsSection.title,
  fields: (cmsSection.fields || []).map(convertCMSFieldToFormField),
});

export const FormBlock: React.FC<FormBlockProps> = ({ form }) => {
  // Handle different relationship formats from Payload
  let actualForm: CMSFormData | null = null;
  let formId: string | null = null;

  if (typeof form === 'string') {
    formId = form;
  } else if (form && typeof form === 'object') {
    // Check if it's a populated form object
    if ('id' in form && 'fields' in form) {
      actualForm = form as CMSFormData;
      formId = form.id;
    } else if ('value' in form && typeof form.value === 'string') {
      // Relationship format: { value: 'id' }
      formId = form.value;
    } else if ('id' in form) {
      formId = form.id as string;
    }
  }

  // If we don't have form data but have an ID, we'd need to fetch it
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

  // Check if form has sections or fields
  const hasSections = actualForm?.sections && actualForm.sections.length > 0;
  const hasFields = actualForm?.fields && actualForm.fields.length > 0;

  if (!actualForm || (!hasSections && !hasFields)) {
    return null;
  }

  // Convert CMS form to FormRenderer config
  const formConfig: FormConfig = {
    id: actualForm.id,
    title: actualForm.title,
    // Use sections if available, otherwise fall back to flat fields
    ...(hasSections
      ? {
          sections: actualForm.sections.map(convertCMSSectionToFormSection),
        }
      : {
          fields: actualForm.fields?.map(convertCMSFieldToFormField) || [],
        }),
    submitButtonLabel: actualForm.submitButtonLabel || 'Submit',
    onSubmit: async formData => {
      if (!formId) {
        throw new Error('Form ID is missing');
      }
      await PayloadAPI.submitForm(formId, formData);
    },
    onSuccess: () => {
      // Handle redirect if needed
      if (actualForm?.confirmationType === 'redirect' && actualForm.redirect) {
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
    },
    successMessage: actualForm.confirmationMessage
      ? 'Form submitted successfully!'
      : 'Form submitted successfully!',
    showSuccessMessage:
      actualForm.confirmationType === 'message' || !actualForm.confirmationType,
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

        <FormRenderer config={formConfig} />
      </div>
    </div>
  );
};

export default FormBlock;
