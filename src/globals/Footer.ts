import type { GlobalConfig } from 'payload';
import LinkGroup from '@/fields/LinkGroup';

const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true, // Public read access
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Footer Links',
      admin: {
        description: 'Add links to display in the footer',
      },
      fields: [LinkGroup],
    },
  ],
};

export default Footer;
