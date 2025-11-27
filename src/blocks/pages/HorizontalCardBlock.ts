import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';
import CommonCard from '@/blocks/CommonCard';
import InfoOverlay from '@/blocks/global/InfoOverlay';

const HorizontalCardBlock: Block = {
  slug: 'horizontal-card-block',
  fields: [
    // Only use headline from InlineHeader, not description
    {
      name: 'headline',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional headline for the block',
      },
    },
    {
      name: 'cardType',
      type: 'select',
      required: true,
      options: [
        { label: 'Common Cards', value: 'common' },
        { label: 'Info Overlay Cards', value: 'overlay' },
      ],
      defaultValue: 'common',
      admin: {
        description: 'Choose the type of cards to display',
      },
    },
    {
      name: 'cards',
      type: 'blocks',
      label: 'Cards',
      minRows: 1,
      blocks: [CommonCard],
      admin: {
        condition: (data: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.cardType === 'common',
        description: 'Add Common Cards (traditional cards with CTA)',
      },
    },
    {
      name: 'overlayCards',
      type: 'blocks',
      label: 'Info Overlay Cards',
      minRows: 1,
      blocks: [InfoOverlay],
      admin: {
        condition: (data: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.cardType === 'overlay',
        description: 'Add Info Overlay Cards (cards that open overlays)',
      },
    },
    LinkGroup,
  ],
};

export default HorizontalCardBlock;
