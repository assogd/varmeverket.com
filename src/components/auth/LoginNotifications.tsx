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
      showError('Error, try again in a minute', { duration: 10000 });
      hasNotified.current = true;
    }
  }, [errorMessage, showError, showSuccess]);

  return null;
};

export default LoginNotifications;
