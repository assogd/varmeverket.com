import type { Block } from 'payload';
import { InlineHeader } from '@/fields/InlineHeader';
import PartnerBlock from '@/blocks/brand/PartnerBlock';

const LogotypeWall: Block = {
  slug: 'logotype-wall',
  imageURL: '/block-thumbnails/logotype-wall.png',
  imageAltText: 'Logotype Wall Block',
  fields: [
    ...InlineHeader,
    {
      name: 'partners',
      type: 'blocks',
      label: 'Partners',
      minRows: 1,
      blocks: [PartnerBlock],
    },
  ],
};

export default LogotypeWall;
