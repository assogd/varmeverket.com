'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useSession } from '@/hooks/useSession';
import { profilePhotoUrl } from '@/utils/imageUrl';
import { LockIcon } from '@/components/icons';
import { FadeIn } from '@/components/ui/FadeIn';
import { Avatar, getInitials } from '@/components/ui';
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
  const {
    user,
    profilePhotoUrl: profilePhotoUrlFromSession,
    loading,
  } = useSession();

  // Resolve avatar URL once per session/photo change (API URL or build from session file_key)
  const avatarImageUrl = useMemo(
    () =>
      profilePhotoUrlFromSession ??
      (user?.profileImage ? profilePhotoUrl(user.profileImage) : undefined),
    [profilePhotoUrlFromSession, user?.profileImage]
  );

  // Base styles: same size/shape as hamburger button
  const baseButtonClasses = clsx(
    `fixed top-4 left-[3.65em] sm:top-2 sm:left-[2.65em] z-30`,
    `${NAV_DIMENSIONS.BORDER_RADIUS}`,
    `cursor-pointer text-white ${NAV_DIMENSIONS.WIDTH} ${NAV_DIMENSIONS.HEIGHT}`,
    'flex items-center justify-center overflow-hidden'
  );

  // When there's no avatar image (lock icon or initials), match hamburger border
  const borderedButtonClasses = clsx(
    baseButtonClasses,
    'border-text',
    !mounted && 'mix-blend-multiply bg-text',
    mounted && isDarkMode && 'border',
    mounted && !isDarkMode && 'mix-blend-multiply bg-text'
  );

  // When there IS an avatar image, keep same box but without the white border
  const imageButtonClasses = clsx(
    baseButtonClasses,
    !mounted && '',
    mounted && !isDarkMode && ''
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
        className={borderedButtonClasses}
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

  // Logged in: profile image (Avatar) or initials in same box as hamburger button
  const initials =
    user?.name && typeof user.name === 'string'
      ? getInitials(user.name)
      : user?.email
        ? String(user.email[0] ?? 'U').toUpperCase()
        : 'U';

  return (
    <FadeIn
      variant="fadeDown"
      timing="normal"
      delay={fadeInDelay}
      className={avatarImageUrl ? imageButtonClasses : borderedButtonClasses}
    >
      <Link
        href="/dashboard"
        aria-label="Go to dashboard"
        className="w-full h-full flex items-center justify-center font-sans text-sm font-medium"
      >
        {avatarImageUrl ? (
          <Avatar
            user={user}
            profileImageUrl={avatarImageUrl}
            size="md"
            className="w-full h-full"
          />
        ) : (
          <span className="select-none">{initials}</span>
        )}
      </Link>
    </FadeIn>
  );
};

export default AuthButton;
