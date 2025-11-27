import type { Field } from 'payload';

const SEOFields: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'SEO Title',
      required: false,
      admin: {
        description:
          'Custom title for search engines. If empty, the page title will be used.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'SEO Description',
      required: false,
      admin: {
        description:
          'Meta description for search engines. Should be 150-160 characters.',
        rows: 3,
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'SEO Image',
      required: false,
      admin: {
        description:
          'Image used when sharing on social media (Open Graph/Twitter Card). Recommended size: 1200x630px.',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'No Index',
      defaultValue: false,
      admin: {
        description: 'Prevent search engines from indexing this page.',
      },
    },
  ],
};

export default SEOFields;
