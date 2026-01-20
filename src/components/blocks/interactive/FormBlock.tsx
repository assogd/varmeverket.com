'use client';

import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings';
import { submitForm } from '@/services/formService';
import { FormRenderer } from '@/components/forms';
import type {
  FormConfig,
  FormField,
  FormSection,
  FormContentBlock,
  FormFieldBlock,
  FormSectionBlock,
} from '@/components/forms';
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
  content?: FormContentBlock[]; // New blocks-based structure
  fields?: CMSFormField[]; // Old structure (backward compatibility)
  sections?: CMSFormSection[]; // Old structure (backward compatibility)
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

// Convert form field block to FormRenderer field
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
  };
};

// Convert form section block to FormRenderer section
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

// Convert blocks array to FormConfig format
const convertBlocksToFormConfig = (
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

// Convert CMS form field to FormRenderer field (backward compatibility)
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

// Convert CMS form section to FormRenderer section (backward compatibility)
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
    // Check for new blocks-based structure (content) or old structure (fields/sections)
    if (
      'id' in form &&
      ('content' in form || 'fields' in form || 'sections' in form)
    ) {
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

  // Check what structure the form uses
  const hasContent = actualForm?.content && actualForm.content.length > 0;
  const hasSections =
    actualForm?.sections && actualForm.sections.length > 0;
  const hasFields = actualForm?.fields && actualForm.fields.length > 0;

  if (!actualForm || (!hasContent && !hasSections && !hasFields)) {
    return null;
  }

  // Convert CMS form to FormRenderer config
  let formConfig: FormConfig = {
    id: actualForm.id,
    title: actualForm.title,
    submitButtonLabel: actualForm.submitButtonLabel || 'Submit',
    onSubmit: async formData => {
      if (!formId) {
        throw new Error('Form ID is missing');
      }
      // Use form service for consistent error handling
      await submitForm(formId, formData);
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

  // Use new blocks-based structure if available, otherwise fall back to old structure
  if (hasContent && actualForm.content) {
    const converted = convertBlocksToFormConfig(actualForm.content);
    formConfig = { ...formConfig, ...converted };
  } else if (hasSections && actualForm.sections) {
    formConfig.sections = actualForm.sections.map(convertCMSSectionToFormSection);
  } else if (hasFields && actualForm.fields) {
    formConfig.fields = actualForm.fields.map(convertCMSFieldToFormField);
  }

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
