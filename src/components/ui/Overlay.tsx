'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  componentName?: string;
  closeOnOutsideClick?: boolean;
  zIndex?: number;
}

const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  backgroundClassName = 'bg-bg',
  componentName = 'Overlay',
  closeOnOutsideClick = false,
  zIndex = 50,
}) => {
  // Handle escape key and prevent scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${backgroundClassName} select-none ${className}`}
      style={{ zIndex }}
      onClick={closeOnOutsideClick ? handleOverlayClick : undefined}
    >
      <DevIndicator componentName={componentName} position="top-center" />

      {/* Content */}
      {children}
    </motion.div>
  );
};

export default Overlay;
