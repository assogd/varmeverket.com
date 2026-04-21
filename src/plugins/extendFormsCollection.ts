import type { Plugin, Config, Field } from 'payload';
import { allFormBlocks } from '@/blocks/forms';

function getFieldName(field: Field): string | undefined {
  return 'name' in field && typeof field.name === 'string'
    ? field.name
    : undefined;
}

/**
 * Plugin to extend the forms collection with blocks-based content support
 * This extends the forms collection created by formBuilderPlugin
 *
 * The new structure uses a single "content" blocks array that can contain:
 * - Individual form field blocks (FormFieldText, FormFieldEmail, etc.)
 * - Form section blocks (which contain form field blocks)
 *
 * This replaces the old fields/sections arrays for a unified blocks architecture.
 *
 * Also reorganizes fields for better UX:
 * - Adds slug field for backend API connection
 * - Moves Content field higher up (after title)
 * - Removes Emails field
 * - Moves Submit Button Label to end
 */
export const extendFormsCollection: Plugin = (
  incomingConfig: Config
): Config => {
  // Clone the config to avoid mutations
  const config = { ...incomingConfig };

  // Find the forms collection index
  const formsCollectionIndex = config.collections?.findIndex(
    collection => collection.slug === 'forms'
  );

  if (
    formsCollectionIndex !== undefined &&
    formsCollectionIndex !== -1 &&
    config.collections
  ) {
    // Clone the existing collection config
    const formsCollection = { ...config.collections[formsCollectionIndex] };

    // Forms embedded in pages/articles must be readable anonymously so REST can
    // populate the relationship and the frontend can render FormBlock. Never
    // restrict read on this collection for "protection" — submissions go to backend.
    formsCollection.access = {
      ...(formsCollection.access || {}),
      read: () => true,
    };

    // Set admin group to 'Content' to match other content collections
    formsCollection.admin = {
      ...formsCollection.admin,
      group: 'Content',
    };

    // Get existing fields
    const existingFields = (formsCollection.fields || []) as Field[];

    // Separate fields by type
    const titleField = existingFields.find(f => getFieldName(f) === 'title');
    const slugField = existingFields.find(f => getFieldName(f) === 'slug');
    const submitButtonLabelField = existingFields.find(
      f => getFieldName(f) === 'submitButtonLabel'
    );
    const confirmationFields = existingFields.filter(f => {
      const name = getFieldName(f);
      return (
        name === 'confirmationType' ||
        name === 'confirmationMessage' ||
        name === 'redirect'
      );
    });

    // Filter out fields we want to remove or reorder
    const fieldsToKeep = existingFields.filter((field: Field) => {
      const name = getFieldName(field);
      return (
        name !== 'title' &&
        name !== 'slug' &&
        name !== 'submitButtonLabel' &&
        name !== 'confirmationType' &&
        name !== 'confirmationMessage' &&
        name !== 'redirect' &&
        name !== 'fields' &&
        name !== 'sections' &&
        name !== 'content' &&
        name !== 'emails'
      );
    }); // Remove emails field

    // Build new fields array in proper order
    const newFields: Field[] = [];

    // 1. Title (first)
    if (titleField) {
      newFields.push(titleField);
    }

    // 2. Slug (for backend API connection)
    if (slugField) {
      newFields.push(slugField);
    } else {
      // Add slug field if it doesn't exist
      newFields.push({
        name: 'slug',
        type: 'text',
        label: 'Slug',
        required: true,
        unique: true,
        admin: {
          position: 'sidebar',
          description:
            'Backend bucket name for submissions. Must match the form segment in POST/GET /v3/forms/... on the API (same identifier as portal admin submissions and JSON forms, e.g. medlemskap). Use lowercase, no spaces.',
        },
        hooks: {
          beforeValidate: [
            ({ value, data }) => {
              // Auto-generate slug from title if not provided
              if (!value && data?.title) {
                return data.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
              }
              return value;
            },
          ],
        },
      });
    }

    // 3. Content (blocks-based form fields and sections)
    newFields.push({
      name: 'content',
      type: 'blocks',
      label: 'Content',
      admin: {
        description:
          'Add form fields and sections. You can mix individual fields and sections in any order.',
      },
      blocks: allFormBlocks,
    });

    // 4. Submit Button Label (directly under Content)
    if (submitButtonLabelField) {
      newFields.push(submitButtonLabelField);
    }

    // 5. Other fields (confirmation, etc.)
    newFields.push(...confirmationFields);

    // 6. Any other remaining fields
    newFields.push(...fieldsToKeep);

    // Update the collection with reordered fields
    formsCollection.fields = newFields;

    // Replace the original collection with the modified one
    config.collections[formsCollectionIndex] = formsCollection;
  }

  return config;
};
