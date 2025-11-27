export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationDismissal = 'auto' | 'manual' | 'both';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  dismissal: NotificationDismissal;
  duration?: number; // in milliseconds, only used for auto dismissal
  onDismiss?: () => void;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}
