'use client';

import React, { useState } from 'react';
import { Overlay } from '@/components/ui';
import ShowcaseCarousel from '@/components/blocks/ShowcaseCarousel';

interface ShowcaseOverlayProps {
  showcase: {
    id: string;
    title: string;
    slug: string;
    description?: unknown;
    featuredImage?: {
      id: string;
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    assets?: Array<{
      id: string;
      blockType: 'imageWithCaption' | 'videoWithCaption' | 'text';
      image?: {
        id: string;
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
      caption?: string;
      host?: string;
      playbackId?: string;
      video?: {
        id: string;
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
      autoplay?: boolean;
      controls?: boolean;
      title?: string;
      content?: unknown;
    }>;
    client?: string;
    year?: number;
    tags?: Array<{
      id: string;
      tag: string;
    }>;
  };
  onClose: () => void;
}

const ShowcaseOverlay: React.FC<ShowcaseOverlayProps> = ({
  showcase,
  onClose,
}) => {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentAsset, setCurrentAsset] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCurrentAssetChange = (index: number, asset: any) => {
    setCurrentAssetIndex(index);
    setCurrentAsset(asset);
  };
  return (
    <Overlay
      isOpen={true}
      onClose={onClose}
      componentName="ShowcaseOverlay"
      closeOnOutsideClick={true}
      backgroundClassName="bg-crayonBlack"
    >
      <div
        className="relative w-full h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="absolute top-0 left-0 p-2 flex gap-x-3 z-10 text-offWhite">
          <span className="uppercase">{showcase.title}</span>
          <span>({showcase.year})</span>
          {showcase.assets && showcase.assets.length > 1 && (
            <div className="flex gap-x-3 fixed bottom-2 left-2 sm:static">
              <span>
                {currentAssetIndex + 1}/{showcase.assets.length}
              </span>
              {(currentAsset?.caption ||
                (currentAsset?.blockType === 'text' &&
                  currentAsset?.title)) && (
                <span>{currentAsset.caption || currentAsset.title}</span>
              )}
            </div>
          )}
        </header>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 z-20 text-offWhite"
        >
          Stäng
        </button>

        {/* Content */}
        {/* Assets Carousel */}
        {showcase.assets && showcase.assets.length > 0 && (
          <ShowcaseCarousel
            assets={showcase.assets}
            onCurrentAssetChange={handleCurrentAssetChange}
          />
        )}
      </div>
    </Overlay>
  );
};

export default ShowcaseOverlay;
