import type { Block } from 'payload';
import FormFieldText from './FormFieldText';
import FormFieldTextarea from './FormFieldTextarea';
import FormFieldEmail from './FormFieldEmail';
import FormFieldSelect from './FormFieldSelect';
import FormFieldCheckbox from './FormFieldCheckbox';
import FormFieldNumber from './FormFieldNumber';
import FormFieldState from './FormFieldState';
import FormFieldCountry from './FormFieldCountry';
import FormFieldTel from './FormFieldTel';
import FormFieldUrl from './FormFieldUrl';
import FormFieldDate from './FormFieldDate';
import FormFieldMessage from './FormFieldMessage';

const FormSection: Block = {
  slug: 'formSection',
  labels: {
    singular: 'Form Section',
    plural: 'Form Sections',
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
      type: 'blocks',
      label: 'Fields',
      required: true,
      minRows: 1,
      blocks: [
        FormFieldText,
        FormFieldTextarea,
        FormFieldEmail,
        FormFieldSelect,
        FormFieldCheckbox,
        FormFieldNumber,
        FormFieldState,
        FormFieldCountry,
        FormFieldTel,
        FormFieldUrl,
        FormFieldDate,
        FormFieldMessage,
      ],
    },
  ],
};

export default FormSection;
