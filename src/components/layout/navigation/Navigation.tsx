'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { NavigationProps } from './types';
import NavigationButton from './NavigationButton';
import HighlightLink from './HighlightLink';
import Logo from './Logo';
import MenuOverlay from './MenuOverlay';
import AuthButton from './AuthButton';
import { FadeIn } from '@/components/ui/FadeIn';

const Navigation: React.FC<NavigationProps> = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fadeInStartTime, setFadeInStartTime] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
    // Once mounted, wait a brief moment then start all fade-ins simultaneously
    const timer = setTimeout(() => {
      setFadeInStartTime(Date.now());
    }, 100);
    return () => clearTimeout(timer);
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
              fadeInDelay={0.4}
            />
            {navigation.highlight && (
              <HighlightLink
                key={`highlight-${fadeInStartTime}`}
                link={navigation.highlight}
                onClick={handleLinkClick}
                isDarkMode={isDarkMode}
                mounted={mounted}
                fadeInDelay={0.4}
              />
            )}
            <AuthButton
              key={`auth-${fadeInStartTime}`}
              isDarkMode={isDarkMode}
              mounted={mounted}
              fadeInDelay={0.4}
            />
            <FadeIn
              key={`logo-${fadeInStartTime}`}
              variant="fadeDown"
              timing="normal"
              delay={0.4}
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
