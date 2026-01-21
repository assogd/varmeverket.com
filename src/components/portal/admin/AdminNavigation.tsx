'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const adminNavItems = [
  { label: 'SUBMISSIONS', href: '/portal/admin/submissions', shape: 'square' },
  { label: 'USERS', href: '/portal/admin/users', shape: 'circle' },
  { label: 'BOOKINGS', href: '/portal/admin/bookings', shape: 'triangle' },
];

export function AdminNavigation() {
  const pathname = usePathname();

  // Determine active item - check if pathname matches or is the base /portal/admin
  const getActiveItem = () => {
    if (
      pathname === '/portal/admin' ||
      pathname === '/portal/admin/'
    ) {
      return '/portal/admin';
    }
    return pathname;
  };

  const activeHref = getActiveItem();

  return (
    <div className="p-2">
      <div className="flex w-full max-w-2xl mx-auto gap-4 mb-8">
        {adminNavItems.map((item, index) => {
          // For base route, only match exactly
          // For other routes, match exactly or if pathname starts with the href
          const isActive =
            item.href === '/portal/admin'
              ? activeHref === '/portal/admin'
              : activeHref === item.href || pathname?.startsWith(`${item.href}/`);
          const shapeClass =
            item.shape === 'circle'
              ? 'rounded-full'
              : item.shape === 'triangle'
                ? ''
                : '';
          const shapeStyle =
            item.shape === 'triangle'
              ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
              : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center justify-center uppercase',
                'border border-text dark:border-dark-text',
                'w-1/4 aspect-square',
                shapeClass,
                isActive
                  ? 'text-text dark:text-dark-text underline'
                  : 'text-text dark:text-dark-text'
              )}
              style={shapeStyle}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
