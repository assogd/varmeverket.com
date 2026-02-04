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

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/f7f14da6-8371-465e-9a52-bf7ad8a2ae59', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'Chrome.tsx:mainNav',
      message: 'Main nav visibility',
      data: {
        pathname: pathname ?? '(null)',
        hideChrome,
        hasNavigation: !!navigation,
        menuItemsCount: navigation?.menuItems?.length ?? 0,
        showMainNav,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId: 'mainNav',
    }),
  }).catch(() => {});
  // #endregion

  return (
    <>
      {showMainNav && <Navigation navigation={navigation!} />}
      <main className={mainClassName}>{children}</main>
      {!hideChrome && <Footer links={footerLinks} />}
    </>
  );
};

export default Chrome;
