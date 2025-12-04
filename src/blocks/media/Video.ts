import type { Block } from 'payload';

const Video: Block = {
  slug: 'video',
  fields: [
    {
      name: 'host',
      type: 'select',
      label: 'Video Host',
      required: true,
      defaultValue: 'mux',
      options: [
        { label: 'Mux', value: 'mux' },
        { label: 'Self-hosted', value: 'video' },
      ],
      admin: {
        description:
          'Select the video host. Mux provides adaptive streaming, Self-hosted uses uploaded video files.',
      },
    },
    {
      name: 'sources',
      type: 'array',
      label: 'Mux Video Sources',
      minRows: 0,
      admin: {
        condition: (data: unknown, siblingData: unknown) =>
          (siblingData as { host?: string })?.host === 'mux',
        description:
          'Add one or more Mux video sources for different screen sizes and/or qualities. The best match will be chosen automatically, or the user can select quality if adaptive resolution is off.',
      },
      fields: [
        {
          name: 'playbackId',
          type: 'text',
          label: 'Mux Playback ID',
          required: true,
        },
        {
          name: 'minWidth',
          type: 'number',
          label: 'Minimum Screen Width (px)',
          required: true,
          admin: {
            description:
              'Use 0 for mobile, 768 for tablet, 1200 for desktop, etc. The video with the highest minWidth less than or equal to the screen width will be used.',
          },
        },
      ],
    },
    {
      name: 'videoFile',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data: unknown, siblingData: unknown) =>
          (siblingData as { host?: string })?.host === 'video',
        description:
          'Upload a video file (MP4, WebM, etc.) for self-hosted videos.',
      },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay',
      defaultValue: false,
      admin: {
        description: 'If enabled, video will autoplay, be muted, and loop.',
      },
    },
    {
      name: 'controls',
      type: 'checkbox',
      label: 'Show Controls',
      defaultValue: false,
      admin: {
        description: 'Show player controls (play, pause, etc.)',
      },
    },
    {
      name: 'adaptiveResolution',
      type: 'checkbox',
      label: 'Adaptive Resolution',
      defaultValue: true,
      admin: {
        condition: (data: unknown, siblingData: unknown) =>
          (siblingData as { host?: string })?.host === 'mux',
        description:
          'If unchecked, users can manually select video quality in the frontend. Only available for Mux videos.',
      },
    },
  ],
};

export default Video;
