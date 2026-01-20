import type { Block } from 'payload';

const FormFieldCheckbox: Block = {
  slug: 'formFieldCheckbox',
  labels: {
    singular: 'Checkbox Field',
    plural: 'Checkbox Fields',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Field Name',
      required: true,
      admin: {
        description: 'Unique identifier for this field (e.g., "agreeToTerms")',
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
      name: 'defaultValue',
      type: 'checkbox',
      label: 'Default Value',
      defaultValue: false,
    },
  ],
};

export default FormFieldCheckbox;
