'use client';

import Model3D from '@/components/ui/Model3DLazy';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { fixModelUrl } from '@/utils/modelUrl';

interface Model3DBlockProps {
  model: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1", "21/9"
  height?: string; // Legacy field for backward compatibility
}

export default function Model3DBlock({
  model,
  autoRotate = true,
  autoRotateSpeed = 0.3,
  aspectRatio = '16/9', // Default aspect ratio
  height, // Legacy field for backward compatibility
}: Model3DBlockProps) {
  // Use aspect ratio if available, otherwise fall back to height for backward compatibility
  const containerStyle = aspectRatio
    ? {
        aspectRatio: aspectRatio,
        maxWidth: '100%',
      }
    : {
        height: height || '600px',
        maxWidth: '100%',
      };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <DevIndicator componentName="Model3DBlock" position="top-left" />

      <div className="w-full" style={containerStyle}>
        <Model3D
          modelPath={fixModelUrl(model.url)}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          interactive={false} // Disable all interactions for better performance
          height="100%"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
