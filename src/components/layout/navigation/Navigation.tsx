'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import { NavigationProps } from './types';
import NavigationButton from './NavigationButton';
import HighlightLink from './HighlightLink';
import Logo from './Logo';
import MenuOverlay from './MenuOverlay';
import AuthButton from './AuthButton';
import { FadeIn } from '@/components/ui/FadeIn';
import { getPathTheme } from '@/config/portalTheme';

const Navigation: React.FC<NavigationProps> = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fadeInStartTime, setFadeInStartTime] = useState<number | null>(null);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // Use path-based theme so nav matches the page (and is visible on portal where path is dark
  // but next-themes resolvedTheme can lag, making mix-blend-multiply nav invisible on dark bg).
  const pathTheme = getPathTheme(pathname);
  const isDarkMode = mounted && (pathTheme === 'dark' || resolvedTheme === 'dark');

  useEffect(() => {
    setMounted(true);
    // Show nav content immediately so main nav is visible without a long blank period
    const t = Date.now();
    setFadeInStartTime(t);
  }, []);

  const handleToggleNav = () => {
    setIsOpen(prev => !prev);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <MenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        menuItems={navigation.menuItems}
        isDarkMode={isDarkMode}
        onLinkClick={handleLinkClick}
      />
      <nav>
        {fadeInStartTime !== null && (
          <>
            <NavigationButton
              key={fadeInStartTime}
              isOpen={isOpen}
              onToggle={handleToggleNav}
              isDarkMode={isDarkMode}
              mounted={mounted}
              fadeInDelay={0.1}
            />
            {navigation.highlight && (
              <HighlightLink
                key={`highlight-${fadeInStartTime}`}
                link={navigation.highlight}
                onClick={handleLinkClick}
                isDarkMode={isDarkMode}
                mounted={mounted}
                fadeInDelay={0.1}
              />
            )}
            <AuthButton
              key={`auth-${fadeInStartTime}`}
              isDarkMode={isDarkMode}
              mounted={mounted}
              fadeInDelay={0.1}
            />
            <FadeIn
              key={`logo-${fadeInStartTime}`}
              variant="fadeDown"
              timing="normal"
              delay={0.1}
              className="absolute top-4 right-4 sm:top-2 sm:right-2 z-10"
            >
              <Logo />
            </FadeIn>
          </>
        )}
      </nav>
    </>
  );
};

export default Navigation;
