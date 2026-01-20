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

  return (
    <div className="flex gap-4 mb-8 border-b border-text/20 dark:border-dark-text/20">
      {settingsNavItems.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'pb-4 px-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-text dark:text-dark-text border-b-2 border-text dark:border-dark-text'
                : 'text-text/70 dark:text-dark-text/70 hover:text-text dark:hover:text-dark-text'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
