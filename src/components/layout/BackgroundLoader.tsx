'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface BackgroundLoaderProps {
  children: React.ReactNode;
}

/**
 * Component that prevents content from showing until the background is properly loaded
 * This helps avoid the flash of content without background that can occur during theme transitions
 */
export const BackgroundLoader: React.FC<BackgroundLoaderProps> = ({
  children,
}) => {
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setIsMounted(true);

    // Small delay to ensure theme has been applied and background is rendered
    const timer = setTimeout(() => {
      setIsBackgroundLoaded(true);
    }, 100); // Short delay to ensure smooth background loading

    return () => clearTimeout(timer);
  }, []);

  // When theme changes, briefly hide content to ensure smooth transition
  useEffect(() => {
    if (isMounted) {
      setIsBackgroundLoaded(false);

      const timer = setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 150); // Slightly longer delay for theme transitions

      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, isMounted]);

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
