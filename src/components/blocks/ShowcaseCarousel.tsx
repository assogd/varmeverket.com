'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { RichText } from '@payloadcms/richtext-lexical/react';
import VideoBlock from '@/components/blocks/VideoBlock';
import { ReusableCarousel, CarouselItem } from '@/components/carousels';
import { fixImageUrl, fixVideoUrl } from '@/utils/imageUrl';

interface ShowcaseAsset extends CarouselItem {
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
  title?: string; // Title for text blocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any; // Rich text content for text blocks
}

interface ShowcaseCarouselProps {
  assets: ShowcaseAsset[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCurrentAssetChange?: (currentIndex: number, currentAsset: any) => void;
}

const ShowcaseCarousel: React.FC<ShowcaseCarouselProps> = ({
  assets,
  onCurrentAssetChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Map<number, HTMLVideoElement | null>>(new Map());

  // Handle current item change
  const handleCurrentItemChange = (index: number, item: CarouselItem) => {
    setCurrentIndex(index);
    onCurrentAssetChange?.(index, item as ShowcaseAsset);
  };

  // Control video playback when slide changes
  useEffect(() => {
    assets.forEach((asset, index) => {
      if (asset.blockType === 'videoWithCaption') {
        const videoElement = videoRefs.current.get(index);
        if (videoElement) {
          if (index === currentIndex) {
            // Play the active video
            videoElement.play().catch(err => {
              console.error('Failed to play video:', err);
            });
          } else {
            // Pause inactive videos
            videoElement.pause();
          }
        }
      }
    });
  }, [currentIndex, assets]);

  // Apply mute state to all videos
  useEffect(() => {
    assets.forEach((asset, index) => {
      if (asset.blockType === 'videoWithCaption') {
        const videoElement = videoRefs.current.get(index);
        if (videoElement) {
          videoElement.muted = isMuted;
        }
      }
    });
  }, [isMuted, assets]);

  // Handle mute state changes from ReusableCarousel
  const handleMuteChange = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  // Check if current item is a video (for showing mute button)
  const isVideoItem = (item: CarouselItem): boolean => {
    const asset = item as ShowcaseAsset;
    return asset.blockType === 'videoWithCaption';
  };

  // Preload all videos when carousel mounts
  useEffect(() => {
    assets.forEach((asset, index) => {
      if (asset.blockType === 'videoWithCaption') {
        const videoElement = videoRefs.current.get(index);
        if (videoElement && videoElement.readyState < 3) {
          // Preload if not already loaded
          videoElement.load();
        }
      }
    });
  }, [assets]);

  return (
    <>
      {/* Preload all videos (hidden) */}
      {assets.map((asset, index) => {
        if (asset.blockType === 'videoWithCaption') {
          if (asset.host === 'mux' && asset.playbackId) {
            // Mux videos are handled by MuxPlayer and will preload automatically
            return null;
          }
          if (asset.host === 'video' && asset.video) {
            return (
              <video
                key={`preload-${asset.id}-${index}`}
                ref={el => {
                  if (el) {
                    videoRefs.current.set(index, el);
                  }
                }}
                src={fixVideoUrl(asset.video.url)}
                preload="auto"
                muted
                loop
                style={{ display: 'none' }}
                playsInline
              />
            );
          }
        }
        return null;
      })}

      <ReusableCarousel
        items={assets}
        onCurrentItemChange={handleCurrentItemChange}
        showIndicators={false}
        showNavigationArrows={false}
        autoFocus={true}
        enableKeyboardNavigation={true}
        enableTouchSwipe={true}
        enableClickNavigation={true}
        swipeThreshold={50}
        debugMode={false}
        muteControl={{
          onMuteChange: handleMuteChange,
          showOnItem: isVideoItem,
        }}
      >
        {(item, index) => {
          const asset = item as ShowcaseAsset;
          switch (asset.blockType) {
            case 'imageWithCaption':
              return (
                asset.image && (
                  <Image
                    src={fixImageUrl(asset.image.url)}
                    alt={asset.image.alt || asset.caption || ''}
                    width={asset.image.width}
                    height={asset.image.height}
                    className="h-full w-full max-h-screen max-w-screen object-center object-contain"
                    priority={index === 0}
                  />
                )
              );

            case 'videoWithCaption':
              if (asset.host === 'mux' && asset.playbackId) {
                return (
                  <div className="relative w-full h-full">
                    <VideoBlock
                      host="mux"
                      sources={[
                        {
                          playbackId: asset.playbackId,
                          minWidth: 0,
                        },
                      ]}
                      controls={false}
                      autoplay={index === currentIndex}
                      loop={true}
                      adaptiveResolution={true}
                      muted={isMuted}
                    />
                  </div>
                );
              }
              if (asset.host === 'video' && asset.video) {
                return (
                  <div className="relative w-full h-full">
                    <video
                      ref={el => {
                        if (el) {
                          videoRefs.current.set(index, el);
                          el.muted = isMuted;
                        }
                      }}
                      src={fixVideoUrl(asset.video.url)}
                      autoPlay={index === currentIndex}
                      muted={isMuted}
                      loop
                      controls={false}
                      className="h-full w-full max-h-screen max-w-screen object-center object-contain"
                      playsInline
                      preload="auto"
                    />
                  </div>
                );
              }
              return null;

            case 'text':
              return (
                <div className="w-full h-full flex items-center justify-center sm:text-md md:text-md lg:text-lg p-2 sm:p-4 md:p-8 text-center max-w-6xl mx-auto">
                  {asset.content && <RichText data={asset.content} />}
                </div>
              );

            default:
              return null;
          }
        }}
      </ReusableCarousel>
    </>
  );
};

export default ShowcaseCarousel;
