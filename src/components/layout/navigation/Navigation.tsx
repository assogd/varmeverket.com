'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { NavigationProps } from './types';
import NavigationButton from './NavigationButton';
import HighlightLink from './HighlightLink';
import Logo from './Logo';
import MenuOverlay from './MenuOverlay';
import { FadeIn } from '@/components/ui/FadeIn';

const Navigation: React.FC<NavigationProps> = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
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
        <NavigationButton
          isOpen={isOpen}
          onToggle={handleToggleNav}
          isDarkMode={isDarkMode}
          mounted={mounted}
        />
        {navigation.highlight && (
          <HighlightLink
            link={navigation.highlight}
            onClick={handleLinkClick}
            isDarkMode={isDarkMode}
            mounted={mounted}
          />
        )}
        <FadeIn
          variant="fadeDown"
          timing="normal"
          delay={0.4}
          className="absolute top-4 right-4 sm:top-2 sm:right-2 z-10"
        >
          <Logo />
        </FadeIn>
      </nav>
    </>
  );
};

export default Navigation;
