'use client';
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from './Notification';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);
  // const [, setDragConstraints] = useState({ top: 0, bottom: 0 });

  // Handle ESC key to close the latest notification
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && notifications.length > 0) {
        // Remove the latest notification (index 0)
        const latestNotification = notifications[0];
        removeNotification(latestNotification.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifications, removeNotification]);

  // Handle swipe down gesture to dismiss
  const handlePanEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    notificationId: string
  ) => {
    const { offset, velocity } = info;

    // If swiped down more than 100px or with high velocity, dismiss the notification
    if (offset.y > 100 || velocity.y > 500) {
      removeNotification(notificationId);
    }
  };

  return (
    <div
      className="fixed top-4 left-1/2 max-w-72 w-full -translate-x-1/2 z-50 select-none cursor-pointer notification-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          className="relative"
          layout
          initial={false}
          animate={{
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1,
            },
          }}
        >
          <AnimatePresence>
            {notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={notification.id}
                className="w-full shadow-sm absolute top-0 left-0"
                layout
                drag="y" // Enable vertical dragging
                dragConstraints={{ top: 0, bottom: 0 }} // Prevent dragging up, allow dragging down
                dragElastic={0.2} // Add some elastic resistance
                onPanEnd={(event, info) =>
                  handlePanEnd(event, info, notification.id)
                }
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: isHovered ? index * 60 : index * 8, // More space when hovered (60px vs 8px)
                  scale: isHovered ? 1 : 1 - index * 0.02, // Newest (index 0) full scale
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 0,
                  scale: 0.95,
                  transition: {
                    duration: 0.7,
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  scale: 1.01,
                  transition: {
                    duration: 0.15,
                    ease: 'easeInOut',
                  },
                }}
                whileTap={{
                  scale: 0.98, // Slight press feedback for touch
                  transition: {
                    duration: 0.1,
                    ease: 'easeInOut',
                  },
                }}
                whileDrag={{
                  scale: 1.02, // Slight scale up while dragging
                  transition: {
                    duration: 0.1,
                    ease: 'easeInOut',
                  },
                }}
                style={{
                  zIndex: 1000 + (4 - index), // Newest (index 0) gets highest z-index (1004)
                  pointerEvents: 'auto',
                  cursor: 'grab', // Show grab cursor on desktop
                }}
              >
                <Notification
                  notification={notification}
                  onDismiss={removeNotification}
                  isHovered={isHovered}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
