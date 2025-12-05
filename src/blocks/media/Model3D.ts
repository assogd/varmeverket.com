import type { Block } from 'payload';

const Model3D: Block = {
  slug: '3D',
  labels: {
    singular: '3D Model',
    plural: '3D Models',
  },
  fields: [
    {
      name: 'model',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload a 3D model file (GLB/GLTF format)',
      },
    },
    {
      name: 'autoRotate',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable automatic rotation of the 3D model',
      },
    },
    {
      name: 'autoRotateSpeed',
      type: 'number',
      defaultValue: 0.3,
      admin: {
        description: 'Speed of automatic rotation (0.1 = slow, 1.0 = fast)',
        step: 0.1,
      },
      min: 0,
      max: 2,
    },
    {
      name: 'height',
      type: 'text',
      defaultValue: '600px',
      admin: {
        description:
          'Height of the 3D viewer (DEPRECATED: Use aspect ratio instead)',
        readOnly: true,
        condition: () => false, // Hide the field
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16/9',
      options: [
        { label: '16:9 (Widescreen)', value: '16/9' },
        { label: '4:3 (Standard)', value: '4/3' },
        { label: '1:1 (Square)', value: '1/1' },
        { label: '21:9 (Ultrawide)', value: '21/9' },
        { label: '3:2 (Photo)', value: '3/2' },
        { label: '9:16 (Portrait)', value: '9/16' },
      ],
      admin: {
        description: 'Aspect ratio of the 3D viewer (responsive)',
      },
    },
  ],
};

export default Model3D;
