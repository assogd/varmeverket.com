'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExitPreviewButtonProps {
  className?: string;
}

/**
 * Exit Preview Button Component
 *
 * Shows an exit preview button when in preview mode.
 * Client component that handles smooth exit preview experience.
 */
export const ExitPreviewButton: React.FC<ExitPreviewButtonProps> = ({
  className,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const router = useRouter();

  // Check preview status on mount and when it changes
  useEffect(() => {
    const checkPreviewStatus = () => {
      // Check for preview mode by looking at URL search params and cookies
      const urlParams = new URLSearchParams(window.location.search);
      const hasPreviewParam = urlParams.get('preview') === 'true';

      // Check for preview cookie (set by the preview API)
      const hasPreviewCookie = document.cookie.includes('preview=true');

      const isPreviewMode = hasPreviewParam || hasPreviewCookie;
      setIsPreview(isPreviewMode);
    };

    checkPreviewStatus();

    // Check periodically for preview status changes
    const interval = setInterval(checkPreviewStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExitPreview = async () => {
    try {
      await fetch('/api/preview', {
        method: 'DELETE',
      });
      // Redirect to current page without preview params
      const currentPath = window.location.pathname;
      router.push(currentPath);
      router.refresh();
    } catch (error) {
      console.error('Error exiting preview mode:', error);
    }
  };

  // Don't render if not in preview mode
  if (!isPreview) {
    return null;
  }

  return (
    <button
      onClick={handleExitPreview}
      className={`text-center grow px-2 py-2.5 sm:py-1 rounded-sm hover:bg-white/10 ${className || ''}`}
    >
      Exit preview
    </button>
  );
};

export default ExitPreviewButton;
