import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*', 'model/gltf-binary', 'model/gltf+json'],
    adminThumbnail: ({ doc }: { doc: Record<string, unknown> }) => {
      // For images, use the image itself as thumbnail
      if ((doc.mimeType as string)?.startsWith('image/')) {
        return doc.url as string;
      }
      // For videos, we could generate a thumbnail or use a default
      return null;
    },
  },
};
