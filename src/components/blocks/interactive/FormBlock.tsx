'use client';

import React, { useState, useCallback } from 'react';
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
  FormValues,
} from '@/components/forms';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { spaceConverter } from '@/utils/richTextConverters';
import { jsxConverter } from '@/utils/richTextConverters/index';

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
  slug?: string; // Slug for backend API connection
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

/** Lexical rich text shape for block description (same as FAQBlock) */
type BlockDescription = {
  root: {
    children: Array<{
      type: string;
      children?: Array<{ text?: string; type?: string }>;
    }>;
  };
};

interface FormBlockProps {
  /** Optional block headline (InlineHeader) — rendered like FAQBlock */
  headline?: string;
  /** Optional block description rich text — rendered like FAQBlock */
  description?: BlockDescription;
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

  // Convert conditionalField (CMS JSON) to showIf function if present
  let showIf: ((formValues: FormValues) => boolean) | undefined = block.showIf;
  if (!showIf && block.conditionalField) {
    const { conditionToShowIf } = require('@/components/forms');
    showIf = conditionToShowIf(block.conditionalField);
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
    showIf,
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

export const FormBlock: React.FC<FormBlockProps> = ({
  form,
  headline,
  description,
}) => {
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
  const hasSections = actualForm?.sections && actualForm.sections.length > 0;
  const hasFields = actualForm?.fields && actualForm.fields.length > 0;

  if (!actualForm || (!hasContent && !hasSections && !hasFields)) {
    return null;
  }

  // Convert CMS form to FormRenderer config
  // Use slug for backend API submission, fallback to id if slug not available
  const formSlug = actualForm.slug || actualForm.id;

  const isRedirectConfirmation =
    actualForm.confirmationType === 'redirect' && actualForm.redirect;
  const hasConfirmationRichText =
    actualForm.confirmationMessage &&
    typeof actualForm.confirmationMessage === 'object' &&
    actualForm.confirmationMessage.root;

  let formConfig: FormConfig = {
    id: actualForm.id,
    title: actualForm.title,
    submitButtonLabel: actualForm.submitButtonLabel || 'Skicka',
    onSubmit: async formData => {
      if (!formSlug) {
        throw new Error('Form slug is missing');
      }
      // Use form service for consistent error handling
      // Backend API expects slug: POST /v3/forms/<slug>
      await submitForm(formSlug, formData);
    },
    onSuccess: () => {
      // Redirect: navigation only; no inline success view
      if (isRedirectConfirmation && actualForm.redirect) {
        if (actualForm.redirect.type === 'custom' && actualForm.redirect.url) {
          window.location.href = actualForm.redirect.url;
        } else if (
          actualForm.redirect.type === 'reference' &&
          actualForm.redirect.reference &&
          typeof actualForm.redirect.reference === 'object'
        ) {
          // Handle internal redirect based on relationTo
          const { relationTo, value } = actualForm.redirect.reference as {
            relationTo?: string;
            value?: string;
          };
          if (relationTo === 'pages' && value) {
            window.location.href = `/${value}`;
          } else if (relationTo === 'spaces' && value) {
            window.location.href = `/spaces/${value}`;
          } else if (relationTo === 'articles' && value) {
            window.location.href = `/artikel/${value}`;
          }
        }
      }
    },
    // Inline rich-text confirmation: replace form, no toast
    ...(hasConfirmationRichText &&
      !isRedirectConfirmation && {
        successContent: (
          <RichText
            data={actualForm.confirmationMessage as never}
            converters={spaceConverter}
            className="text-left sm:text-center [&_a]:underline"
          />
        ),
        showSuccessMessage: false,
      }),
    // Fallback toast only when no rich text confirmation
    ...(!hasConfirmationRichText &&
      !isRedirectConfirmation && {
        successMessage: 'Tack! Ditt meddelande har skickats.',
        showSuccessMessage:
          actualForm.confirmationType === 'message' ||
          !actualForm.confirmationType,
      }),
    // Redirect: avoid toast flash before navigation
    ...(isRedirectConfirmation && { showSuccessMessage: false }),
  };

  // Use new blocks-based structure if available, otherwise fall back to old structure
  if (hasContent && actualForm.content) {
    const converted = convertBlocksToFormConfig(actualForm.content);
    formConfig = { ...formConfig, ...converted };
  } else if (hasSections && actualForm.sections) {
    formConfig.sections = actualForm.sections.map(
      convertCMSSectionToFormSection
    );
  } else if (hasFields && actualForm.fields) {
    formConfig.fields = actualForm.fields.map(convertCMSFieldToFormField);
  }

  return (
    <FormBlockInner
      actualForm={actualForm}
      formConfig={formConfig}
      headline={headline}
      description={description}
    />
  );
};

function FormBlockInner({
  actualForm,
  formConfig,
  headline,
  description,
}: {
  actualForm: CMSFormData;
  formConfig: FormConfig;
  headline?: string;
  description?: BlockDescription;
}) {
  const [showHeader, setShowHeader] = useState(true);
  const onInlineSuccess = useCallback(() => setShowHeader(false), []);

  const configWithCallback: FormConfig =
    formConfig.successContent && showHeader
      ? { ...formConfig, onInlineSuccess }
      : formConfig;

  return (
    <div className="relative px-4 pt-8 pb-12">
      <DevIndicator componentName="FormBlock" />

      {/* Same header pattern as FAQBlock; actualForm.title is h2 backup when no headline */}
      {showHeader && (headline || description || actualForm.title) && (
        <div className="mb-8 text-center">
          {(headline || actualForm.title) && (
            <Heading variant="content-h2" as="h2" className="mb-4 px-2">
              {headline || actualForm.title}
            </Heading>
          )}
          {description && (
            <RichText
              data={description as never}
              converters={jsxConverter}
              className="grid justify-center"
            />
          )}
        </div>
      )}

      <div className="border-t border-b border-text py-2">
        <FormRenderer config={configWithCallback} />
      </div>
    </div>
  );
}

export default FormBlock;
