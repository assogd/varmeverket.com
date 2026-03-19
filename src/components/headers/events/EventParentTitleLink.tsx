'use client';

import React from 'react';
import Link from 'next/link';

export function EventParentTitleLink({
  parentTitle,
  parentSlug,
  className,
}: {
  parentTitle?: string;
  parentSlug?: string;
  className?: string;
}) {
  if (!parentTitle || !parentSlug) return null;

  return (
    <p className={className ?? 'px-4 font-sans mb-4 text-center uppercase'}>
      Del av{' '}
      <Link href={`/evenemang/${parentSlug}`} className="underline">
        {parentTitle}
      </Link>
    </p>
  );
}
