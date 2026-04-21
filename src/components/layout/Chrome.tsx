'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation, { type NavigationData, Footer } from '@/components/layout';
import type { LinkGroup } from '@/utils/linkRouter';

interface ChromeProps {
  navigation: NavigationData | null;
  footerLinks?: Array<{ link: LinkGroup }>;
  mainClassName?: string;
  children: React.ReactNode;
}

export const Chrome: React.FC<ChromeProps> = ({
  navigation,
  footerLinks,
  mainClassName,
  children,
}) => {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith('/login');
  const showMainNav = !hideChrome && !!navigation;

  return (
    <>
      {showMainNav && <Navigation navigation={navigation!} />}
      <main className={mainClassName}>{children}</main>
      {!hideChrome && <Footer links={footerLinks} />}
    </>
  );
};

export default Chrome;
