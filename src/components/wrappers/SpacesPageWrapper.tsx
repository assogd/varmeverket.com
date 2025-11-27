'use client';
import React from 'react';

interface SpacesPageWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper for spaces pages - theme is now automatically controlled by URL
 * All spaces collection pages will automatically use dark mode via UrlBasedTheme
 */
function SpacesPageWrapper({ children }: SpacesPageWrapperProps) {
  return (
    <div className="transition-colors duration-150 ease-out">{children}</div>
  );
}

export default SpacesPageWrapper;
