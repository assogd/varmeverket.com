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
    if (pathname === '/portal/admin' || pathname === '/portal/admin/') {
      return '/portal/admin';
    }
    return pathname;
  };

  const activeHref = getActiveItem();

  return (
    <div className="p-2">
      <div className="flex w-full gap-4 mb-8">
        {adminNavItems.map(item => {
          // For base route, only match exactly
          // For other routes, match exactly or if pathname starts with the href
          const isActive =
            item.href === '/portal/admin'
              ? activeHref === '/portal/admin'
              : activeHref === item.href ||
                pathname?.startsWith(`${item.href}/`);
          const isTriangle = item.shape === 'triangle';
          const shapeClass = item.shape === 'circle' ? 'rounded-full' : '';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'relative flex items-center justify-center uppercase',
                !isTriangle && 'border border-text dark:border-dark-text',
                'w-1/4 aspect-square',
                shapeClass,
                isActive
                  ? 'text-text dark:text-dark-text underline'
                  : 'text-text dark:text-dark-text'
              )}
            >
              {isTriangle && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none scale-[1.08] origin-center"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <polygon
                    points="50,4 96,38 78,96 22,96 4,38"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
