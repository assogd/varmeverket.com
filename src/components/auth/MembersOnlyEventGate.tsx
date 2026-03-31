'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

interface MembersOnlyEventGateProps {
  enabled: boolean;
  children: React.ReactNode;
}

export function MembersOnlyEventGate({
  enabled,
  children,
}: MembersOnlyEventGateProps) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!enabled || loading) return;
    if (!user?.email) {
      // Mirror notFound experience client-side when SSR cannot verify session locally.
      router.replace('/404');
    }
  }, [enabled, loading, user?.email, router]);

  if (!enabled) return <>{children}</>;
  if (loading) return null;
  if (!user?.email) return null;

  return <>{children}</>;
}

