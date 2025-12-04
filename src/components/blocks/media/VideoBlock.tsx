'use client';
import React from 'react';
import VideoPlayer from '@/components/common/VideoPlayer';

interface VideoSource {
  playbackId: string;
  minWidth?: number; // Minimum screen width for this source (e.g., 0 for mobile, 768 for tablet, 1024 for desktop)
  label?: string; // Optional label for quality (e.g., '360p', '720p', '1080p')
}

interface VideoBlockProps {
  host: 'mux' | 'video';
  sources?: VideoSource[]; // for multiple sources
  videoFile?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  adaptiveResolution?: boolean; // default true
  muted?: boolean;
}

const VideoBlock: React.FC<VideoBlockProps> = ({
  host,
  sources = [],
  videoFile,
  autoplay = false,
  loop = false,
  controls = false,
  adaptiveResolution = true,
  muted = true,
}) => {
  // Convert VideoBlock props to VideoPlayer asset format
  const asset = {
    type: host as 'mux' | 'video',
    mux:
      host === 'mux' && sources.length > 0 ? sources[0].playbackId : undefined,
    video:
      host === 'video' && videoFile
        ? {
            url: videoFile.url,
            alt: videoFile.alt,
            width: videoFile.width,
            height: videoFile.height,
          }
        : undefined,
  };

  return (
    <VideoPlayer
      asset={asset}
      variant="default"
      controls={controls}
      autoplay={autoplay}
      loop={loop}
      adaptiveResolution={adaptiveResolution}
      muted={muted}
    />
  );
};

export default VideoBlock;
