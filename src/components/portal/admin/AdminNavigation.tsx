'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const adminNavItems = [
  { label: 'SUBMISSIONS', href: '/portal/admin/submissions', shape: 'square' },
  { label: 'USERS', href: '/portal/admin/users', shape: 'circle' },
  { label: 'BOOKINGS', href: '/portal/admin/bookings', shape: 'polygon' },
  { label: 'EVENTS', href: '/portal/admin/events', shape: 'triangleUp' },
] as const;

type NavShape = (typeof adminNavItems)[number]['shape'];

/** Small shape icons — outline by default; filled when active */
function ShapeIcon({ shape, filled }: { shape: NavShape; filled: boolean }) {
  const box = 'w-8 h-8 shrink-0 text-current';
  const fill = filled ? 'currentColor' : 'none';
  const stroke = 'currentColor';
  const strokeW = filled ? 1.5 : 2;

  if (shape === 'circle') {
    return (
      <svg className={box} viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={filled ? 48 : 46}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shape === 'square') {
    return (
      <svg className={box} viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="28,2 72,2 98,28 98,72 72,98 28,98 2,72 2,28"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinejoin="bevel"
          vectorEffect="non-scaling-stroke"
          shapeRendering="geometricPrecision"
        />
      </svg>
    );
  }
  if (shape === 'triangleUp') {
    return (
      <svg className={box} viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="50,8 92,92 8,92"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  // Default: existing polygon shape
  return (
    <svg className={box} viewBox="0 0 100 100" aria-hidden>
      <polygon
        points="50,6 94,38 76,94 24,94 6,38"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-center w-full gap-12 mt-40">
      {adminNavItems.map(item => {
        const isActive =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center justify-center gap-2 w-28',
              'uppercase',
              'transition-colors'
            )}
          >
            <ShapeIcon shape={item.shape} filled={isActive} />
            <span className="truncate font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
