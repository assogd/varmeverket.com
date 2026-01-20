import type { Block } from 'payload';

const FormFieldEmail: Block = {
  slug: 'formFieldEmail',
  labels: {
    singular: 'Email Field',
    plural: 'Email Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "email")',
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
      type: 'email',
      label: 'Default Value',
    },
  ],
};

export default FormFieldEmail;
