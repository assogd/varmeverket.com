'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Group } from 'three';
import { cn } from '@/utils/cn';

interface Model3DProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  interactive?: boolean; // New prop to disable all interactions
  width?: number | string;
  height?: number | string;
}

// Error boundary component for 3D models
function ModelErrorBoundary({
  children,
  onError,
}: {
  children: React.ReactNode;
  onError: (error: Error) => void;
}) {
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      onError(new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  return <>{children}</>;
}

// 3D Model component with rotation and responsive scaling
function Model({
  modelPath,
  autoRotate = true,
  autoRotateSpeed = 1,
}: {
  modelPath: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onError: (error: Error) => void;
}) {
  // Always call hooks at the top level
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<Group>(null);
  const { viewport, size } = useThree();

  useFrame(state => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y = state.clock.elapsedTime * autoRotateSpeed;
    }
  });

  // Calculate responsive scale based on viewport and screen size
  const minDimension = Math.min(viewport.width, viewport.height);

  // More conservative scaling for better responsiveness
  const baseScale = minDimension * 0.3;
  const maxScale = Math.min(size.width, size.height) * 0.25;
  const scale = Math.min(baseScale, maxScale, 2); // Cap at 2 to prevent huge models

  return (
    <group ref={modelRef} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

// Loading fallback
function ModelLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

// Error display component
function ModelError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg p-8 text-center">
      <div className="text-red-500 mb-4">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        3D Model Error
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        {error.message ||
          'Failed to load the 3D model. This could be due to a network issue or an invalid model file.'}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// Main 3D Model component
export default function Model3D({
  modelPath,
  className,
  autoRotate = true,
  autoRotateSpeed = 1,
  enableZoom = true,
  enablePan = true,
  enableRotate = true,
  interactive = true, // Default to interactive
  width = '100%',
  height = '600px',
}: Model3DProps) {
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleError = (error: Error) => {
    console.error('3D Model Error:', error);
    setError(error);
  };

  const handleRetry = () => {
    setError(null);
    setRetryKey(prev => prev + 1);
  };

  // If there's an error, show the error component
  if (error) {
    return (
      <div
        className={cn('relative w-full overflow-hidden', className)}
        style={{
          width,
          height,
          maxWidth: '100%',
        }}
      >
        <ModelError error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{
        width,
        height,
        maxWidth: '100%',
      }}
    >
      <ModelErrorBoundary onError={handleError}>
        <Canvas
          key={retryKey} // Force re-render on retry
          camera={{ position: [1, 1, 4], fov: 50 }}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
          }}
          gl={{
            antialias: false, // Disable antialiasing for better performance
            alpha: true, // Keep alpha for transparency
            powerPreference: 'high-performance', // Use dedicated GPU if available
            stencil: false, // Disable stencil buffer
            depth: true, // Keep depth buffer for 3D
          }}
          dpr={[1, 2]} // Limit device pixel ratio for performance
          performance={{
            min: 0.5, // Reduce quality when performance is low
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          <Suspense fallback={<ModelLoader />}>
            <Model
              modelPath={modelPath}
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
              onError={handleError}
            />
          </Suspense>

          {interactive && (
            <OrbitControls
              enableZoom={enableZoom}
              enablePan={enablePan}
              enableRotate={enableRotate}
              maxPolarAngle={Math.PI / 1.8} // Limit vertical rotation
              minPolarAngle={Math.PI / 6} // Prevent flipping
              enableDamping={true}
              dampingFactor={0.05}
              // Disable scroll hijacking
              touches={{
                ONE: 2, // Only allow one finger for rotation
                TWO: 0, // Disable two finger gestures (pinch/pan)
              }}
            />
          )}

          <Environment preset="studio" />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
}
