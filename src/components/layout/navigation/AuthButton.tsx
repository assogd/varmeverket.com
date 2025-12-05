'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useSession } from '@/hooks/useSession';
import { LockIcon } from '@/components/icons';
import { FadeIn } from '@/components/ui/FadeIn';
import { NAV_DIMENSIONS } from './constants';

interface AuthButtonProps {
  isDarkMode: boolean;
  mounted: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ isDarkMode, mounted }) => {
  // All hooks must be called before any conditional returns (Rules of Hooks)
  const [isReady, setIsReady] = React.useState(false);
  const { user, loading } = useSession();

  React.useEffect(() => {
    if (mounted) {
      // Small delay to ensure NotificationProvider is ready
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Don't render until mounted and ready to prevent hydration issues
  if (!mounted || !isReady) {
    return null;
  }

  // Get user initials for fallback
  const getInitials = (name: string): string => {
    try {
      if (!name || typeof name !== 'string') {
        return 'U';
      }

      // Remove any non-letter characters and split by whitespace
      const cleanName = name.trim().replace(/[^a-zA-ZåäöÅÄÖ\s]/g, '');
      if (!cleanName || cleanName.length === 0) {
        return 'U';
      }

      const parts = cleanName
        .split(/\s+/)
        .filter(part => part && part.length > 0);
      if (parts.length >= 2) {
        const firstPart = parts[0];
        const lastPart = parts[parts.length - 1];
        const first = firstPart && firstPart.length > 0 ? firstPart[0] : '';
        const last = lastPart && lastPart.length > 0 ? lastPart[0] : '';
        if (first && last) {
          return (first + last).toUpperCase();
        }
        if (first) {
          return first.toUpperCase();
        }
        return 'U';
      }

      // Single word - take first 2 letters
      if (cleanName.length >= 2) {
        return cleanName.substring(0, 2).toUpperCase();
      }
      if (cleanName.length === 1) {
        return cleanName[0].toUpperCase();
      }
      return 'U';
    } catch (error) {
      console.warn('Error getting initials:', error);
      return 'U';
    }
  };

  const authButtonClasses = clsx(
    `fixed top-4 left-[3.65em] sm:top-2 sm:left-[2.65em] z-10`,
    `${NAV_DIMENSIONS.BORDER_RADIUS}`,
    `cursor-pointer text-white ${NAV_DIMENSIONS.WIDTH} ${NAV_DIMENSIONS.HEIGHT}`,
    'flex items-center justify-center overflow-hidden',
    'border-text',
    mounted && isDarkMode && 'border',
    mounted && !isDarkMode && 'mix-blend-multiply bg-text'
  );

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Not logged in - show lock icon linking to login
  if (!user) {
    return (
      <FadeIn
        variant="fadeDown"
        timing="normal"
        delay={0.4}
        className={authButtonClasses}
      >
        <Link
          href="/login"
          aria-label="Sign in"
          className="w-full h-full flex items-center justify-center"
        >
          <LockIcon className={''} size={18} />
        </Link>
      </FadeIn>
    );
  }

  // Logged in - show profile picture or fallback
  const hasProfileImage = false; // TODO: Add profile image field to user data when available

  return (
    <FadeIn
      variant="fadeDown"
      timing="normal"
      delay={0.4}
      className={authButtonClasses}
    >
      <Link
        href="/dashboard"
        aria-label="Go to dashboard"
        className="w-full h-full"
      >
        {hasProfileImage ? (
          <img
            src={''} // TODO: Add profile image URL when available
            alt={user.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-medium text-xs sm:text-[10px]">
            {(() => {
              try {
                if (user.name && typeof user.name === 'string') {
                  return getInitials(user.name);
                }
                if (
                  user.email &&
                  typeof user.email === 'string' &&
                  user.email.length > 0
                ) {
                  const firstChar = user.email[0];
                  // Only use alphanumeric characters
                  if (firstChar && /[a-zA-Z0-9]/.test(firstChar)) {
                    return firstChar.toUpperCase();
                  }
                }
                return 'U';
              } catch (error) {
                console.warn('Error rendering user initials:', error);
                return 'U';
              }
            })()}
          </div>
        )}
      </Link>
    </FadeIn>
  );
};

export default AuthButton;
