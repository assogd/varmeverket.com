'use client';

import { useEffect, useRef } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface LoginNotificationsProps {
  errorMessage?: string | null;
}

export const LoginNotifications = ({ errorMessage }: LoginNotificationsProps) => {
  const { showError } = useNotification();
  const hasNotified = useRef(false);

  const getReadableError = (message: string) => {
    const normalized = message.toLowerCase();
    if (
      normalized.includes('not in our system') ||
      normalized.includes('pending application') ||
      normalized.includes('not activated') ||
      normalized.includes('not enabled')
    ) {
      return 'E-postadressen är inte aktiverad eller inväntar godkännande.';
    }
    if (normalized.includes('email är obligatorisk') || normalized.includes('email is required')) {
      return 'Fyll i din epostadress.';
    }
    return 'Fel, försök igen om en stund.';
  };

  useEffect(() => {
    if (hasNotified.current) return;
    if (errorMessage) {
      showError(getReadableError(errorMessage), { duration: 10000 });
      hasNotified.current = true;
    }
  }, [errorMessage, showError]);

  return null;
};

export default LoginNotifications;
