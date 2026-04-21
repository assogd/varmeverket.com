import type { Block } from 'payload';
import { InlineHeader } from '@/fields/InlineHeader';

const Form: Block = {
  slug: 'form',
  imageURL: '/block-thumbnails/form.png',
  imageAltText: 'Form Block',
  labels: {
    singular: 'Form',
    plural: 'Form Blocks',
  },
  fields: [
    ...InlineHeader,
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Select a form to display on this page',
      },
    },
  ],
};

export default Form;
