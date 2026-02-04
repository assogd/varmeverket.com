'use client';
import { useEffect, useState } from 'react';

interface BackgroundLoaderProps {
  children: React.ReactNode;
}

/**
 * Component that prevents content from showing until mounted (avoids hydration mismatch).
 * We no longer hide content on theme change so the main nav stays visible on portal routes.
 */
export const BackgroundLoader: React.FC<BackgroundLoaderProps> = ({
  children,
}) => {
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsBackgroundLoaded(true);
    }, 0); // Show content on next tick so theme/background is applied
    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg">
        {/* Placeholder to maintain layout */}
      </div>
    );
  }

  // Show loading state until background is ready
  if (!isBackgroundLoaded) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg transition-colors duration-150 ease-out">
        {/* Loading placeholder with same background */}
      </div>
    );
  }

  return <>{children}</>;
};
