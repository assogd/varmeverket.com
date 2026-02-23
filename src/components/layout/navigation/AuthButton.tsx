'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useSession } from '@/hooks/useSession';
import { profilePhotoUrl } from '@/utils/imageUrl';
import { LockIcon } from '@/components/icons';
import { FadeIn } from '@/components/ui/FadeIn';
import { Avatar } from '@/components/ui';
import { NAV_DIMENSIONS } from './constants';

interface AuthButtonProps {
  isDarkMode: boolean;
  mounted: boolean;
  fadeInDelay?: number;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  isDarkMode,
  mounted,
  fadeInDelay = 0.4,
}) => {
  const { user, profilePhotoUrl: profilePhotoUrlFromSession, loading } =
    useSession();

  // Resolve avatar URL once per session/photo change (API URL or build from session file_key)
  const avatarImageUrl = useMemo(
    () =>
      profilePhotoUrlFromSession ??
      (user?.profileImage ? profilePhotoUrl(user.profileImage) : undefined),
    [profilePhotoUrlFromSession, user?.profileImage]
  );

  const authButtonClasses = clsx(
    `fixed top-4 left-[3.65em] sm:top-2 sm:left-[2.65em] z-30`,
    `${NAV_DIMENSIONS.BORDER_RADIUS}`,
    `cursor-pointer text-white ${NAV_DIMENSIONS.WIDTH} ${NAV_DIMENSIONS.HEIGHT}`,
    'flex items-center justify-center overflow-hidden',
    'border-text',
    mounted && isDarkMode && !avatarImageUrl && 'border',
    mounted && !isDarkMode && !avatarImageUrl && 'mix-blend-multiply bg-text'
  );

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show lock icon while loading or not logged in
  if (loading || !user) {
    return (
      <FadeIn
        variant="fadeDown"
        timing="normal"
        delay={fadeInDelay}
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

  // Logged in - show avatar
  return (
    <FadeIn
      variant="fadeDown"
      timing="normal"
      delay={fadeInDelay}
      className={authButtonClasses}
    >
      <Link
        href="/dashboard"
        aria-label="Go to dashboard"
        className="w-full h-full"
      >
        <Avatar
          user={user}
          profileImageUrl={avatarImageUrl}
          size="md"
          className="w-full h-full"
        />
      </Link>
    </FadeIn>
  );
};

export default AuthButton;
