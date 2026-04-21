import type { Block } from 'payload';

const FormFieldCountry: Block = {
  slug: 'formFieldCountry',
  labels: {
    singular: 'Country Field',
    plural: 'Country Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "country")',
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
  ],
};

export default FormFieldCountry;
