import { ReactNode } from 'react';
import { MemberNavigation } from '@/components/layout/MemberNavigation';

export default function PortalLayout({ children }: { children: ReactNode }) {
  // Theme is now handled by UrlBasedTheme component in root layout
  // which detects authenticated routes and sets dark mode automatically
  // Add padding-bottom to account for fixed bottom navigation (h-16 = 4rem = 64px)
  return (
    <>
      <div className="">{children}</div>
      <MemberNavigation />
    </>
  );
}
