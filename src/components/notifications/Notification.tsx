'use client';
import React, { useEffect, useCallback, useRef } from 'react';
import {
  Notification as NotificationType,
  NotificationAction,
} from '@/types/notification';
import { AppAction } from '@/components/ui';
import clsx from 'clsx';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
  isHovered: boolean;
}

const typeStyles = {
  success: 'bg-surface-backdrop',
  error: 'bg-red-500 text-white border-red-600',
  warning: 'bg-yellow-500 text-black border-yellow-600',
  info: 'bg-blue-500 text-white border-blue-600',
};

const iconMap = {
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onDismiss,
  isHovered,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);

  const handleDismiss = useCallback(() => {
    notification.onDismiss?.();
    onDismiss(notification.id);
  }, [onDismiss, notification]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const duration =
      remainingTimeRef.current > 0
        ? remainingTimeRef.current
        : notification.duration;

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);
  }, [notification.duration, handleDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        0,
        (remainingTimeRef.current > 0
          ? remainingTimeRef.current
          : notification.duration || 5000) - elapsed
      );
    }
  }, [notification.duration]);

  useEffect(() => {
    if (
      notification.dismissal === 'auto' ||
      notification.dismissal === 'both'
    ) {
      startTimer();
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [notification.dismissal, startTimer]);

  useEffect(() => {
    if (isHovered) {
      pauseTimer();
    } else if (
      notification.dismissal === 'auto' ||
      notification.dismissal === 'both'
    ) {
      // Add 2 seconds to remaining time when exiting hover
      remainingTimeRef.current = Math.max(remainingTimeRef.current, 0) + 2000;
      startTimer();
    }
  }, [isHovered, pauseTimer, startTimer, notification.dismissal]);

  const handleActionClick = (action: NotificationAction) => {
    action.onClick();
    if (
      notification.dismissal === 'manual' ||
      notification.dismissal === 'both'
    ) {
      handleDismiss();
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full rounded-md touch-manipulation', // Add touch-manipulation for better touch response
        typeStyles[notification.type]
      )}
      onClick={handleDismiss}
      onTouchStart={e => {
        // Prevent default touch behavior that might interfere with drag
        e.stopPropagation();
      }}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 relative hidden">
            {iconMap[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-base">{notification.message}</p>
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {notification.actions.map((action, actionIndex) => (
                  <AppAction
                    key={actionIndex}
                    asButton
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    className="text-xs"
                  >
                    {action.label}
                  </AppAction>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-current focus:outline-none touch-manipulation"
              onClick={e => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                handleDismiss();
              }}
            >
              <span className="font-mono uppercase text-xs opacity-70">
                <span className="hidden sm:inline">Esc</span>
                <span className="sm:hidden">Tap</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
