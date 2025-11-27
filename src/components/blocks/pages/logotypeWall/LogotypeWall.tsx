'use client';
import React from 'react';
import { PartnerCard } from '@/components/blocks/PartnerCard';
import { HorizontalScrollContainer } from '@/components/ui/HorizontalScrollContainer';
import clsx from 'clsx';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';

interface Partner {
  title: string;
  image?: { url: string; alt?: string; width?: number; height?: number };
  url?: string;
}

interface LogotypeWallProps {
  headline?: string;
  description?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  partners: Partner[];
}

export const LogotypeWall: React.FC<LogotypeWallProps> = ({
  headline,
  description,
  partners,
}) => {
  if (partners.length === 0) {
    return null;
  }

  return (
    <section className={`grid relative`}>
      <DevIndicator componentName="LogotypeWall" />
      <BlockHeader headline={headline} description={description} />
      <hr className="mx-2 my-2" />
      <div className="relative">
        <HorizontalScrollContainer
          className=""
          enableOverflowDetection={true}
          showBorders={true}
        >
          {partners.map((partner, idx) => (
            <PartnerCard
              key={idx}
              className={clsx(
                'grow-0 shrink-0 w-[60vw] sm:w-[200px] border-r border-text snap-center rounded-none'
              )}
              {...partner}
            />
          ))}
        </HorizontalScrollContainer>
      </div>
      <hr className="mx-2 my-2" />
    </section>
  );
};

export default LogotypeWall;
