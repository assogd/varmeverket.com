import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Attribute } from '@/components/ui';
import MediaAsset from '@/components/common/MediaAsset';
import { buildConverter } from '@/utils/richTextConverters/index';
import { Heading } from '@/components/headings';

interface Asset {
  type: 'image' | 'mux';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface SpaceHeaderProps {
  spaceData: {
    title?: string;
    capacity?: number;
    areaSize?: number;
    heroAsset?: {
      type?: 'image' | 'mux';
      image?: { url: string; alt?: string; width?: number; height?: number };
      mux?: string;
    };
  };
  header?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text?: any;
    assets?: Asset[];
  };
}

// Custom converter for space headers with label headlines
const spaceConverter = buildConverter({
  paragraph: 'space',
  heading: 'label',
  list: 'default',
});

export default function SpaceHeader({ spaceData, header }: SpaceHeaderProps) {
  const heroAsset = spaceData.header?.heroAsset;

  return (
    <div className="relative">
      <DevIndicator componentName="SpaceHeader" position="top-center" />

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden pt-8 ${
          heroAsset
            ? 'h-[50vh] sm:h-[80vh] min-h-[500px]'
            : 'h-[50vh] sm:h-[70vh] min-h-[450px]'
        }`}
      >
        {/* Background Asset */}
        {heroAsset && (
          <div className="absolute inset-0 opacity-90">
            <MediaAsset asset={heroAsset as Asset} variant="hero" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg to-transparent" />
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 pb-4">
          {/* Space Title */}
          {spaceData.title && (
            <Heading variant="building-title">
              {spaceData.title.toUpperCase()}
            </Heading>
          )}

          {/* Space Attributes */}
          {(spaceData.capacity || spaceData.areaSize) && (
            <div className="flex items-center gap-1 mt-0">
              <Attribute type="custom" value="Space" size="md" />
              {spaceData.capacity && (
                <Attribute
                  type="capacity"
                  value={spaceData.capacity}
                  size="md"
                />
              )}
              {spaceData.areaSize && (
                <Attribute
                  type="area"
                  value={spaceData.areaSize}
                  unit="M2"
                  size="md"
                />
              )}
            </div>
          )}
        </div>
      </div>
      {header?.text && (
        <RichText
          data={header.text}
          className="grid gap-3 justify-center text-center text-md lg:text-lg px-2"
          converters={spaceConverter}
        />
      )}
    </div>
  );
}
