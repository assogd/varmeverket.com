import type { Plugin, Config } from 'payload';

/**
 * Plugin to extend the forms collection with sections support
 * This extends the forms collection created by formBuilderPlugin
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

    // Add the sections field to the collection
    formsCollection.fields = [
      ...(formsCollection.fields || []),
      {
        name: 'sections',
        type: 'array',
        label: 'Form Sections',
        admin: {
          description:
            'Organize form fields into sections. If sections are used, the flat fields array will be ignored.',
        },
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Section Title',
            required: true,
            admin: {
              description: 'The header/title for this section',
            },
          },
          {
            name: 'fields',
            type: 'array',
            label: 'Fields',
            required: true,
            fields: [
              {
                name: 'name',
                type: 'text',
                label: 'Field Name',
                required: true,
                admin: {
                  description:
                    'Unique identifier for this field (e.g., "firstName")',
                },
              },
              {
                name: 'label',
                type: 'text',
                label: 'Field Label',
                required: true,
              },
              {
                name: 'fieldType',
                type: 'select',
                label: 'Field Type',
                required: true,
                options: [
                  { label: 'Text', value: 'text' },
                  { label: 'Textarea', value: 'textarea' },
                  { label: 'Email', value: 'email' },
                  { label: 'Select', value: 'select' },
                  { label: 'Checkbox', value: 'checkbox' },
                  { label: 'Number', value: 'number' },
                  { label: 'State', value: 'state' },
                  { label: 'Country', value: 'country' },
                  { label: 'Date', value: 'date' },
                  { label: 'Tel', value: 'tel' },
                  { label: 'URL', value: 'url' },
                ],
              },
              {
                name: 'required',
                type: 'checkbox',
                label: 'Required',
                defaultValue: false,
              },
              {
                name: 'defaultValue',
                type: 'text',
                label: 'Default Value',
                admin: {
                  description:
                    'Default value for the field (text, number, or boolean)',
                },
              },
              {
                name: 'placeholder',
                type: 'text',
                label: 'Placeholder',
              },
              {
                name: 'helpText',
                type: 'text',
                label: 'Help Text',
                admin: {
                  description: 'Helper text shown below the field',
                },
              },
              {
                name: 'options',
                type: 'array',
                label: 'Options (for select fields)',
                fields: [
                  {
                    name: 'label',
                    type: 'text',
                    label: 'Label',
                    required: true,
                  },
                  {
                    name: 'value',
                    type: 'text',
                    label: 'Value',
                    required: true,
                  },
                ],
                admin: {
                  condition: (data: unknown, siblingData: unknown) =>
                    (siblingData as { fieldType?: string })?.fieldType ===
                    'select',
                },
              },
            ],
          },
        ],
      },
    ];

    // Replace the original collection with the modified one
    config.collections[formsCollectionIndex] = formsCollection;
  }

  return config;
};
