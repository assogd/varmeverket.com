import { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  // Theme is now handled by UrlBasedTheme component in root layout
  // which detects authenticated routes and sets dark mode automatically
  return <>{children}</>;
}
