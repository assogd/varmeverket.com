import type { Block } from 'payload';

const FormFieldDate: Block = {
  slug: 'formFieldDate',
  labels: {
    singular: 'Date Field',
    plural: 'Date Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "birthDate")',
      },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Field Label',
      required: true,
    },
    {
      name: 'required',
      type: 'checkbox',
      label: 'Required',
      defaultValue: false,
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
      name: 'minYear',
      type: 'number',
      label: 'Minimum Year',
      admin: {
        description: 'Minimum year allowed (e.g., 1900)',
      },
    },
    {
      name: 'maxYear',
      type: 'number',
      label: 'Maximum Year',
      admin: {
        description: 'Maximum year allowed (e.g., 2100)',
      },
    },
  ],
};

export default FormFieldDate;
