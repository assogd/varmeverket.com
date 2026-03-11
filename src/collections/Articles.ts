import type { CollectionConfig } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import Image from '@/blocks/media/Image';
import Video from '@/blocks/media/Video';
// import TextBlock from '@/blocks/articles/TextBlock';
import CTA from '@/blocks/interactive/CTA';
import QA from '@/blocks/interactive/QA';
import LogotypeWall from '@/blocks/brand/LogotypeWall';
import PartnerBlock from '@/blocks/brand/PartnerBlock';
import Model3D from '@/blocks/media/Model3D';
import MinimalCarousel from '@/blocks/layout/MinimalCarousel';
import CardGrid from '@/blocks/layout/CardGrid';
import SEOFields from '@/fields/SEOFields';
import { authenticated } from '@/access/authenticated';
// import { authenticatedOrPublished } from '@/access/authenticatedOrPublished';
import { commonHooks, commonVersioning } from '@/utils/hooks';

const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      // Allow reading if user is authenticated or if post is published
      if (user) return true;
      return {
        status: {
          equals: 'published',
        },
      };
    },
    update: authenticated,
  },
  // No defaultPopulate — it can cause the REST find response to omit relationship
  // fields like `form` / `formSlug` when the frontend fetches the article.
  admin: {
    defaultColumns: ['title', 'status', 'author', 'publishedDate', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The main title of the article',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: false,
      admin: {
        position: 'sidebar',
        description:
          'URL-friendly version of the title (auto-generated if empty)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publication status of the article',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The author of this article',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'The date when this article was first published',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'lastModifiedDate',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'The date when this article was last edited',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              label: 'Header',
              fields: [
                {
                  name: 'text',
                  type: 'richText',
                  required: false,
                  admin: {
                    description: 'Main header text content for this article',
                  },
                },
                {
                  name: 'assets',
                  type: 'array',
                  label: 'Assets',
                  minRows: 0,
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Mux Video', value: 'mux' },
                        { label: 'Self-hosted Video', value: 'video' },
                      ],
                      required: false,
                    },
                    {
                      name: 'placement',
                      type: 'select',
                      label: 'Placement',
                      options: [
                        { label: 'Before Text', value: 'before' },
                        { label: 'After Text', value: 'after' },
                      ],
                      defaultValue: 'before',
                      required: true,
                      admin: {
                        description:
                          'Choose where this asset should appear relative to the header text content',
                      },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'image',
                      },
                    },
                    {
                      name: 'mux',
                      type: 'text', // Store Mux asset ID or playback ID
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'mux',
                      },
                    },
                    {
                      name: 'video',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'video',
                      },
                    },
                  ],
                  required: false,
                },
              ],
              required: false,
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description: 'Main image displayed at the top of the article',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: false,
              admin: {
                description:
                  'A brief summary or excerpt of the article (used in listings and social media)',
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags' as const,
              hasMany: true,
              required: false,
              admin: {
                description: 'Select one or more tags for this article',
              },
            },
            {
              name: 'introduction',
              type: 'richText',
              required: false,
              admin: {
                description:
                  'Optional introduction section (appears before main content)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  BlocksFeature({
                    blocks: [
                      Image,
                      Video,
                      CTA,
                      QA,
                      LogotypeWall,
                      PartnerBlock,
                      Model3D,
                      MinimalCarousel,
                      CardGrid,
                    ],
                  }),
                ],
              }),
              admin: {
                description:
                  'The main content of the article. You can insert blocks (images, quotes, videos, etc.) anywhere within the content using the block button.',
              },
            },
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: false,
              // Always expose on read so anonymous article fetches still get id/value
              access: {
                read: () => true,
              },
              maxDepth: 0,
              admin: {
                description:
                  'Optional form to display on this article. Slug is copied to formSlug on save so the frontend can load it even when the API omits the relationship.',
              },
            },
            {
              name: 'formSlug',
              type: 'text',
              required: false,
              access: {
                read: () => true,
              },
              admin: {
                description:
                  'Auto-set from the selected form’s slug on save. Used when the REST API does not return the form relationship.',
                readOnly: true,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [SEOFields],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      commonHooks.dateTracking,
      ({ data, operation }) => {
        // Auto-set published date when status changes to published
        if (operation === 'create' || operation === 'update') {
          if (data.status === 'published' && !data.publishedDate) {
            data.publishedDate = new Date().toISOString();
          }
        }
      },
      // Persist form slug so frontend can load form when REST omits `form` relationship
      async ({ data, req }) => {
        const formRef = data.form;
        if (formRef == null || formRef === '') {
          data.formSlug = null;
          return data;
        }
        const id =
          typeof formRef === 'string'
            ? formRef
            : typeof formRef === 'object' &&
                formRef !== null &&
                'id' in formRef &&
                typeof (formRef as { id: unknown }).id === 'string'
              ? (formRef as { id: string }).id
              : null;
        if (!id || !req?.payload) {
          return data;
        }
        try {
          const formDoc = await req.payload.findByID({
            collection: 'forms',
            id,
            depth: 0,
          });
          const slug =
            formDoc && typeof formDoc === 'object' && 'slug' in formDoc
              ? String((formDoc as { slug?: string }).slug || '')
              : '';
          data.formSlug = slug || null;
        } catch {
          // leave formSlug unchanged
        }
        return data;
      },
    ],
  },
  versions: commonVersioning,
};

export default Articles;
