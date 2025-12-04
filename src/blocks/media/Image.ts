import type { Block } from 'payload';

const Image: Block = {
  slug: 'image',
  imageURL: '/block-thumbnails/image.png',
  imageAltText: 'Image Block',
  labels: {
    singular: 'Image',
    plural: 'Image Blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The image to display',
      },
    },
    {
      name: 'caption',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional caption for the image',
      },
    },
  ],
};

export default Image;
