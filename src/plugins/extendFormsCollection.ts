import type { Plugin, Config } from 'payload';
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

    // Find and remove old fields/sections arrays if they exist
    const existingFields = formsCollection.fields || [];
    const filteredFields = existingFields.filter(
      (field: { name?: string }) =>
        field.name !== 'fields' && field.name !== 'sections'
    );

    // Add the new content blocks field
    formsCollection.fields = [
      ...filteredFields,
      {
        name: 'content',
        type: 'blocks',
        label: 'Content',
        admin: {
          description:
            'Add form fields and sections. You can mix individual fields and sections in any order.',
        },
        blocks: allFormBlocks,
      },
    ];

    // Replace the original collection with the modified one
    config.collections[formsCollectionIndex] = formsCollection;
  }

  return config;
};
