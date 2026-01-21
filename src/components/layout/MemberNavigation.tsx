'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { isPortalRoute } from '@/utils/routes';
import { FadeIn } from '@/components/ui/FadeIn';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Bokningar', href: '/bokningar' },
  { label: 'Inställningar', href: '/installningar' },
  { label: 'Admin', href: '/portal/admin' },
];

export const MemberNavigation: React.FC = () => {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Only show for logged in members on portal pages
  if (loading || !user) {
    return null;
  }

  // Only show on portal routes
  if (!isPortalRoute(pathname)) {
    return null;
  }

  // Find active item index
  const activeIndex = navItems.findIndex(
    item => pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );

  // Determine which background to show (hover takes priority, then active)
  const backgroundIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  return (
    <FadeIn
      variant="fadeUp"
      timing="normal"
      delay={0.4}
      once={false}
      customMotionProps={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      className="fixed bottom-0 left-0 right-0 z-50 px-2 py-3"
      as="nav"
    >
      <div className="mx-auto overflow-x-auto px-2 overscroll-x-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-full justify-center">
          <div className="relative inline-flex items-center h-14 bg-[#1F1F1F] bg-opacity-70 rounded-xl backdrop-blur-lg">
            <div className="relative flex items-center h-full w-max">
              {navItems.map((item, index) => {
                const isActive = index === activeIndex;
                const isHovered = index === hoveredIndex;
                const isBackgroundVisible = index === backgroundIndex;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'relative flex items-center justify-center h-full px-4 font-medium whitespace-nowrap',
                      isActive || isHovered
                        ? 'text-text dark:text-dark-text'
                        : 'text-text/70 dark:text-dark-text/70'
                    )}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {isBackgroundVisible && (
                      <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-1 bg-[#212121] bg-opacity-50 rounded-lg"
                        initial={false}
                        transition={{
                          type: 'tween',
                          duration: 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default MemberNavigation;
