import type { Block } from 'payload';
import AssetText from '@/blocks/global/AssetText';

const AssetTextContainer: Block = {
  slug: 'assetTextContainer',
  labels: {
    singular: 'Asset Text Container',
    plural: 'Asset Text Containers',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional headline for the container',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
      admin: {
        description: 'Optional description for the container',
      },
    },
    {
      name: 'assetTextBlocks',
      type: 'blocks',
      label: 'Asset Text Blocks',
      required: true,
      minRows: 1,
      blocks: [AssetText],
      admin: {
        description: 'Add multiple Asset Text blocks to this container',
      },
    },
  ],
};

export default AssetTextContainer;
