import { useNotifications } from '@/contexts/NotificationContext';
import {
  NotificationType,
  NotificationDismissal,
  NotificationAction,
} from '@/types/notification';

interface UseNotificationOptions {
  type?: NotificationType;
  dismissal?: NotificationDismissal;
  duration?: number;
  onDismiss?: () => void;
  actions?: NotificationAction[];
}

export const useNotification = () => {
  const { addNotification, removeNotification, clearAllNotifications } =
    useNotifications();

  const showNotification = (
    message: string,
    options: UseNotificationOptions & { title?: string } = {}
  ) => {
    const {
      type = 'info',
      dismissal = 'auto',
      duration = 5000,
      title,
      onDismiss,
      actions,
    } = options;

    return addNotification({
      type,
      message,
      title,
      dismissal,
      duration,
      onDismiss,
      actions,
    });
  };

  const showSuccess = (
    message: string,
    options: Omit<UseNotificationOptions, 'type'> & { title?: string } = {}
  ) => {
    return showNotification(message, { ...options, type: 'success' });
  };

  const showError = (
    message: string,
    options: Omit<UseNotificationOptions, 'type'> & { title?: string } = {}
  ) => {
    return showNotification(message, { ...options, type: 'error' });
  };

  const showWarning = (
    message: string,
    options: Omit<UseNotificationOptions, 'type'> & { title?: string } = {}
  ) => {
    return showNotification(message, { ...options, type: 'warning' });
  };

  const showInfo = (
    message: string,
    options: Omit<UseNotificationOptions, 'type'> & { title?: string } = {}
  ) => {
    return showNotification(message, { ...options, type: 'info' });
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
  };
};
