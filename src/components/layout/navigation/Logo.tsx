'use client';

import React from 'react';
import Link from 'next/link';

import { VarmeverketIcon } from '@/components/icons';
import { NAV_DIMENSIONS } from './constants';

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <VarmeverketIcon
        size={120}
        className={`text-text ${NAV_DIMENSIONS.LOGO_SIZE} h-auto`}
      />
    </Link>
  );
};

export default Logo;
