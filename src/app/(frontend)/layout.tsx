import React from 'react';
import localFont from 'next/font/local';
import './globals.css';
import Navigation, {
  NavigationData,
  Footer,
  UrlBasedTheme,
  BackgroundLoader,
} from '@/components/layout';
import { ThemeProvider } from 'next-themes';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationContainer } from '@/components/notifications';
import {
  AdminContainer,
  RevalidateButton,
  ExitPreviewButton,
  CachePerformance,
} from '@/components/admin';
import PayloadAPI from '@/lib/api';
import { initializeCacheWarming } from '@/utils/cacheWarmer';
import '@/utils/testCacheMonitor';

const sans = localFont({
  src: [
    {
      path: '../../../public/fonts/ABCMonumentGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/ABCMonumentGrotesk-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const mono = localFont({
  src: [
    {
      path: '../../../public/fonts/ABCMonumentGroteskMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/ABCMonumentGroteskMono-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
});

const display = localFont({
  src: [
    {
      path: '../../../public/fonts/HALColantTest-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/HALColantTest-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-display',
  display: 'swap',
});

const ballPill = localFont({
  src: [
    {
      path: '../../../public/fonts/BallPill-medium.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-ballPill',
  display: 'swap',
});

export const metadata = {
  description:
    'Värmeverket är ett nav för innovation, kreativitet och gemenskap i Stockholm.',
  title: 'Värmeverket',
};

// Allow caching with reasonable revalidation
export const revalidate = 3600; // 1 hour

// Allow caching when possible, but keep dynamic for user-specific content
export const dynamic = 'auto';

async function getNavigation() {
  try {
    const response = await PayloadAPI.find({
      collection: 'navigation',
      depth: 3, // Populate nested navigation relationships
      limit: 1,
    });

    if (response.docs[0]) {
      return response.docs[0] as NavigationData;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch navigation in layout:', error);
    return null;
  }
}

async function getFooter() {
  try {
    const footer = await PayloadAPI.getGlobal<{ links?: Array<{ link: unknown }> }>(
      'footer',
      3
    );
    return footer;
  } catch (error) {
    console.error('Failed to fetch footer in layout:', error);
    return null;
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  // Initialize cache warming in the background
  initializeCacheWarming();
  const navigation = await getNavigation();
  const footer = await getFooter();
  const useCustomFonts = true;
  const htmlClass = useCustomFonts
    ? `${sans.variable} ${mono.variable} ${display.variable} ${ballPill.variable} font-sans bg-bg dark:bg-dark-bg text-text dark:text-dark-text`
    : '';

  // Get pathname from headers to determine if we're on homepage
  // const headersList = await import('next/headers').then(m => m.headers());
  // const pathname = headersList.get('x-pathname') || '/';

  const mainClassName = 'min-h-screen';

  return (
    <html lang="sv" className={htmlClass} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey={null}
        >
          <NotificationProvider>
            <UrlBasedTheme>
              <BackgroundLoader>
                {navigation && <Navigation navigation={navigation} />}
                <main className={mainClassName}>
                  {children}
                  <Footer links={footer?.links} />
                </main>
                <AdminContainer>
                  <RevalidateButton />
                  <ExitPreviewButton />
                </AdminContainer>
                <NotificationContainer />
              </BackgroundLoader>
            </UrlBasedTheme>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
