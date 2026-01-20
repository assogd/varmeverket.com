'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { isPortalRoute } from '@/utils/routes';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Bokningar', href: '/bokningar' },
  { label: 'Inställningar', href: '/installningar' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 py-3">
      <div className="max-w-sm mx-auto">
        <div className="relative flex items-center justify-around h-14 bg-[#1F1F1F] bg-opacity-70 rounded-xl backdrop-blur-lg overflow-hidden">
          {/* Animated background that moves between items */}
          {backgroundIndex >= 0 && (
            <motion.div
              layoutId="activeNavBackground"
              className="absolute inset-y-0 bg-[#212121] bg-opacity-50 rounded-lg"
              initial={false}
              transition={{
                type: 'tween',
                duration: 0.2, // 300ms
                ease: 'easeInOut', // Smooth start och slut
              }}
              style={{
                left: `${(backgroundIndex / navItems.length) * 100}%`,
                width: `${100 / navItems.length}%`,
              }}
            />
          )}

          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            const isHovered = index === hoveredIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative flex-1 flex items-center justify-center h-full font-medium transition-colors z-10',
                  isActive || isHovered
                    ? 'text-text dark:text-dark-text'
                    : 'text-text/70 dark:text-dark-text/70'
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MemberNavigation;
