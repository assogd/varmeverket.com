'use client';

import { useEffect, useRef } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface LoginNotificationsProps {
  errorMessage?: string | null;
  sent?: boolean;
}

export const LoginNotifications = ({
  errorMessage,
  sent,
}: LoginNotificationsProps) => {
  const { showError, showSuccess } = useNotification();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    if (errorMessage) {
      showError(errorMessage);
      hasNotified.current = true;
      return;
    }
    if (sent) {
      showSuccess(
        'Kolla din inkorg. Vi har skickat en temporär inloggningslänk till dig.'
      );
      hasNotified.current = true;
    }
  }, [errorMessage, sent, showError, showSuccess]);

  return null;
};

export default LoginNotifications;
