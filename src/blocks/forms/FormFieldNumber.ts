import type { Block } from 'payload';

const FormFieldNumber: Block = {
  slug: 'formFieldNumber',
  labels: {
    singular: 'Number Field',
    plural: 'Number Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "age")',
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
      name: 'defaultValue',
      type: 'number',
      label: 'Default Value',
    },
  ],
};

export default FormFieldNumber;
