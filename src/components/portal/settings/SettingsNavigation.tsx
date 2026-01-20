'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const settingsNavItems = [
  { label: 'PERSONLIGT', href: '/installningar/personligt' },
  { label: 'VERKSAMHET', href: '/installningar/verksamhet' },
  { label: 'KONTO', href: '/installningar/konto' },
];

export function SettingsNavigation() {
  const pathname = usePathname();

  // Determine active item - check if pathname matches or is the base /installningar
  const getActiveItem = () => {
    if (
      pathname === '/installningar' ||
      pathname === '/installningar/personligt'
    ) {
      return '/installningar/personligt';
    }
    return pathname;
  };

  const activeHref = getActiveItem();

  return (
    <div className="p-2">
      <div className="flex mb-8 border border-text max-w-4xl mx-auto">
        {settingsNavItems.map((item, index) => {
          const isActive = activeHref === item.href;
          const isLast = index === settingsNavItems.length - 1;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center justify-center uppercase',
                'border-r border-text dark:border-dark-text',
                'p-4 flex-1', // Equal growth for all buttons
                isLast && 'border-r-0', // Remove border on last item
                isActive
                  ? 'text-text dark:text-dark-text underline'
                  : 'text-text dark:text-dark-text'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
