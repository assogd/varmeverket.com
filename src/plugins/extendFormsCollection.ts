import type { Plugin, Config, Field } from 'payload';
import { allFormBlocks } from '@/blocks/forms';

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

    // Set admin group to 'Content' to match other content collections
    formsCollection.admin = {
      ...formsCollection.admin,
      group: 'Content',
    };

    // Get existing fields
    const existingFields = (formsCollection.fields || []) as Field[];

    // Separate fields by type
    const titleField = existingFields.find(f => f.name === 'title');
    const slugField = existingFields.find(f => f.name === 'slug');
    const submitButtonLabelField = existingFields.find(
      f => f.name === 'submitButtonLabel'
    );
    const confirmationFields = existingFields.filter(
      f =>
        f.name === 'confirmationType' ||
        f.name === 'confirmationMessage' ||
        f.name === 'redirect'
    );

    // Filter out fields we want to remove or reorder
    const fieldsToKeep = existingFields.filter(
      (field: Field) =>
        field.name !== 'title' &&
        field.name !== 'slug' &&
        field.name !== 'submitButtonLabel' &&
        field.name !== 'confirmationType' &&
        field.name !== 'confirmationMessage' &&
        field.name !== 'redirect' &&
        field.name !== 'fields' &&
        field.name !== 'sections' &&
        field.name !== 'content' &&
        field.name !== 'emails' // Remove emails field
    );

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
