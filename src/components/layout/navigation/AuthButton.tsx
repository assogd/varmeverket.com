'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useSession } from '@/hooks/useSession';
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
  const { user, loading } = useSession();

  const authButtonClasses = clsx(
    `fixed top-4 left-[3.65em] sm:top-2 sm:left-[2.65em] z-30`,
    `${NAV_DIMENSIONS.BORDER_RADIUS}`,
    `cursor-pointer text-white ${NAV_DIMENSIONS.WIDTH} ${NAV_DIMENSIONS.HEIGHT}`,
    'flex items-center justify-center overflow-hidden',
    'border-text',
    mounted && isDarkMode && 'border',
    mounted && !isDarkMode && 'mix-blend-multiply bg-text'
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

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/f7f14da6-8371-465e-9a52-bf7ad8a2ae59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthButton.tsx:render',message:'Client shows avatar (logged in)',data:{hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

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
        <Avatar user={user} className="w-full h-full" />
      </Link>
    </FadeIn>
  );
};

export default AuthButton;
