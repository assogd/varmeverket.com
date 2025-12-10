// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb';

// VERSION STAMP: v0.1.0-coupled-db - Coupled Database Era (Ending)
// This configuration marks the end of the coupled database architecture.
// Next version will transition to external Payload database.
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users, collections } from './schema/index';
import { globals } from './globals/index';
import { extendFormsCollection } from './plugins/extendFormsCollection';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  globals,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      LinkFeature({
        fields: [
          {
            name: 'type',
            type: 'select',
            options: [
              { label: 'Internal Link', value: 'internal' },
              { label: 'External Link', value: 'external' },
            ],
            defaultValue: 'internal',
            required: true,
          },
          {
            name: 'doc',
            type: 'relationship',
            relationTo: ['pages', 'spaces', 'articles'],
            required: false,
            admin: {
              condition: (
                data: unknown,
                siblingData: Record<string, unknown>
              ) => siblingData?.type === 'internal',
            },
          },
          {
            name: 'url',
            type: 'text',
            required: false,
            admin: {
              condition: (
                data: unknown,
                siblingData: Record<string, unknown>
              ) => siblingData?.type === 'external',
            },
          },
          {
            name: 'newTab',
            type: 'checkbox',
            defaultValue: false,
            admin: {
              condition: (
                data: unknown,
                siblingData: Record<string, unknown>
              ) => siblingData?.type === 'external',
            },
          },
        ],
        generateURL: ({ doc, url, type }) => {
          // Handle internal links
          if (type === 'internal' && doc) {
            if (typeof doc === 'object' && doc.value && doc.value.slug) {
              if (doc.relationTo === 'spaces') {
                return `/spaces/${doc.value.slug}`;
              } else if (doc.relationTo === 'articles') {
                return `/artikel/${doc.value.slug}`;
              } else {
                return `/${doc.value.slug}`;
              }
            }
          }

          // Handle external links
          if (type === 'external' && url) {
            return url;
          }

          // Fallback
          return '#';
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  email: nodemailerAdapter({
    defaultFromAddress:
      process.env.PAYLOAD_EMAIL_FROM || 'noreply@varmeverket.com',
    defaultFromName: process.env.PAYLOAD_EMAIL_FROM_NAME || 'Värmeverket',
    transportOptions: {
      host: process.env.SMTP_HOST || 'smtp.resend.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY || '',
      },
      secure: process.env.SMTP_SECURE === 'true', // Use true for port 465
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        state: true,
        country: true,
        checkbox: true,
        number: true,
        message: true,
        payment: false, // Disable payment fields for now
      },
      redirectRelationships: ['pages'], // Collections to use for form redirects
    }),
    extendFormsCollection, // Extend forms collection with sections support
    // storage-adapter-placeholder
  ],
});
