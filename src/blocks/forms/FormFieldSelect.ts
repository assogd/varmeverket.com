import type { Block } from 'payload';

const FormFieldSelect: Block = {
  slug: 'formFieldSelect',
  labels: {
    singular: 'Select Field',
    plural: 'Select Fields',
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
    {
      name: 'options',
      type: 'array',
      label: 'Options',
      required: true,
      minRows: 1,
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
    },
    {
      name: 'defaultValue',
      type: 'text',
      label: 'Default Value',
      admin: {
        description: 'Default selected option value',
      },
    },
  ],
};

export default FormFieldSelect;
