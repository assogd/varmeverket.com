import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { fixImageUrl } from '@/utils/imageUrl';

interface PartnerCardProps {
  title: string;
  image?: { url: string; alt?: string; width?: number; height?: number };
  url?: string;
  className?: string;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  title,
  image,
  url,
  className,
}) => {
  const hasValidUrl = Boolean(url && url !== '#');

  const cardContent = (
    <Image
      src={fixImageUrl(image.url)}
      alt={image.alt || title}
      width={image.width}
      height={image.height}
      className="object-contain h-full w-36 max-w-[50%] mix-blend-multiply"
      quality={75}
      priority={false}
    />
  );

  const wrapperProps = {
    className: clsx(
      'flex items-center justify-center aspect-window w-[80vw] sm:w-[20em]',
      'px-3 sm:px-6 pb-6 relative',
      className
    ),
  };

  if (hasValidUrl) {
    return (
      <a
        href={url!}
        target="_blank"
        rel="noopener noreferrer"
        {...wrapperProps}
      >
        <DevIndicator componentName="PartnerCard (with link" />
        {cardContent}
      </a>
    );
  }

  return (
    <div {...wrapperProps}>
      <DevIndicator componentName="PartnerCard (no link)" />
      {cardContent}
    </div>
  );
};

export default PartnerCard;
