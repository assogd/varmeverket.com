import type { Block } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import Signature from './Signature';

const QA: Block = {
  slug: 'qa',
  labels: {
    singular: 'Q&A',
    plural: 'Q&A Blocks',
  },
  fields: [
    {
      name: 'question',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [Signature],
          }),
        ],
      }),
      validate: (value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { validateNoH1Headings } = require('@/utils/validation');
        return validateNoH1Headings(value);
      },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [Signature],
          }),
        ],
      }),
      validate: (value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { validateNoH1Headings } = require('@/utils/validation');
        return validateNoH1Headings(value);
      },
    },
  ],
};

export default QA;
