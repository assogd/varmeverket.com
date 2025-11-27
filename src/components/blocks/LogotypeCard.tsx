import React from 'react';
import Image from 'next/image';
import { AppAction } from '@/components/ui';
import clsx from 'clsx';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { fixImageUrl } from '@/utils/imageUrl';

interface LogotypeCardProps {
  title: string;
  image?: { url: string; alt?: string; width?: number; height?: number };
  url?: string;
  className?: string;
}

export const LogotypeCard: React.FC<LogotypeCardProps> = ({
  title,
  image,
  url,
  className,
}) => {
  const hasValidUrl = Boolean(url && url !== '#');

  const cardContent = (
    <div
      className={clsx(
        'flex flex-col items-center justify-center',
        'px-4 py-6 rounded-sm min-h-[120px]',
        'border border-text/20 hover:border-text/40 transition-colors',
        'bg-white/5 hover:bg-white/10',
        className
      )}
    >
      <DevIndicator componentName="LogotypeCard" />
      {image && (
        <div className="relative w-full h-16 mb-3 flex items-center justify-center">
          <Image
            src={fixImageUrl(image.url)}
            alt={image.alt || title}
            width={image.width}
            height={image.height}
            className="object-contain max-w-full max-h-full"
            quality={75}
            priority={false}
          />
        </div>
      )}
      <h3 className="text-sm font-medium text-center text-text/80">{title}</h3>
    </div>
  );

  if (hasValidUrl) {
    return (
      <AppAction
        href={url!}
        className="block hover:scale-105 transition-transform duration-200"
      >
        {cardContent}
      </AppAction>
    );
  }

  return cardContent;
};

export default LogotypeCard;
