import type { Block } from 'payload';

const FormFieldTel: Block = {
  slug: 'formFieldTel',
  labels: {
    singular: 'Telephone Field',
    plural: 'Telephone Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "phone")',
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
      type: 'text',
      label: 'Default Value',
    },
  ],
};

export default FormFieldTel;
