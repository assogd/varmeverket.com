'use client';

import { useEffect, useRef } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface LoginNotificationsProps {
  errorMessage?: string | null;
}

export const LoginNotifications = ({ errorMessage }: LoginNotificationsProps) => {
  const { showError } = useNotification();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    if (errorMessage) {
      showError('Fel, försök igen om en stund.', { duration: 10000 });
      hasNotified.current = true;
    }
  }, [errorMessage, showError]);

  return null;
};

export default LoginNotifications;
