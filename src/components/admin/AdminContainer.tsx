'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface AdminContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Admin Container Component
 *
 * A wrapper container for admin buttons positioned in the bottom-right corner.
 * Accepts children (buttons) to be displayed in a vertical stack.
 * Only renders in development mode and not on portal pages.
 */
export const AdminContainer: React.FC<AdminContainerProps> = ({
  children,
  className,
}) => {
  const pathname = usePathname();

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Don't show on portal routes
  const isPortalRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/bokningar') ||
    pathname?.startsWith('/installningar') ||
    pathname?.startsWith('/login');

  if (isPortalRoute) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-[3.1rem] sm:bottom-11 left-2 sm:left-auto md:bottom-2 right-2 z-20 sm:z-30 mix-blend-difference bg-text text-bg flex flex-row rounded-md divide-x ${className || ''}`}
    >
      {children}
    </div>
  );
};

export default AdminContainer;
