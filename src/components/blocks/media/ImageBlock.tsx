import React from 'react';
import Image from 'next/image';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { fixImageUrl } from '@/utils/imageUrl';

interface ImageBlockProps {
  image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  caption?: string;
}

export default function ImageBlock({ image, caption }: ImageBlockProps) {
  return (
    <div className="relative max-h-[80vh] mx-auto my-8 flex items-center justify-center flex-col px-2">
      <DevIndicator componentName="ImageBlock" />
      <Image
        src={fixImageUrl(image.url)}
        alt={image.alt || ''}
        width={image.width || 1200}
        height={image.height || 800}
        className="object-contain max-h-full h-auto w-auto rounded-md sm:rounded-lg object-center"
      />
      {caption && <p className="text-sm mt-1 px-1 w-full">{caption}</p>}
    </div>
  );
}
