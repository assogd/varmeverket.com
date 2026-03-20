'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BackendAPI from '@/lib/backendApi';
import { useSession } from '@/hooks/useSession';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/buttons/Button';

type SavedState = 'unknown' | 'saved' | 'not_saved';

interface EventSavedActionBarProps {
  eventId: string;
  hasForm?: boolean;
}

export function EventSavedActionBar({
  eventId,
  hasForm = false,
}: EventSavedActionBarProps) {
  const { user, loading: sessionLoading } = useSession();
  const { showError, showSuccess } = useNotification();

  const barRef = useRef<HTMLDivElement | null>(null);

  const [savedState, setSavedState] = useState<SavedState>('unknown');
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveringSaved, setHoveringSaved] = useState(false);

  const canShow = Boolean(user?.email && eventId && !hasForm);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!canShow) {
        setSavedState('unknown');
        setConfirmingRemove(false);
        return;
      }

      setSavedState('unknown');
      setConfirmingRemove(false);

      try {
        const savedEvents = await BackendAPI.getSavedEvents(
          user?.email as string
        );
        const isSaved = savedEvents.some(se => se.article_id === eventId);
        if (cancelled) return;
        setSavedState(isSaved ? 'saved' : 'not_saved');
      } catch {
        if (!cancelled) setSavedState('not_saved');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [canShow, eventId, user?.email]);

  useEffect(() => {
    if (savedState !== 'saved') {
      setConfirmingRemove(false);
    }
  }, [savedState]);

  // When the confirmation step is open, clicking outside the sticky bar
  // should dismiss it.
  useEffect(() => {
    if (!confirmingRemove) return;
    if (saving || sessionLoading) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = barRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;

      if (!el.contains(target)) {
        setConfirmingRemove(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [confirmingRemove, saving, sessionLoading]);

  if (!canShow) return null;

  const mainLabel =
    savedState === 'saved'
      ? confirmingRemove
        ? 'Avbryt'
        : hoveringSaved
          ? 'Ta bort'
          : 'Sparad'
      : 'Spara';
  const showConfirmRemove =
    savedState === 'saved' && confirmingRemove && !saving && !sessionLoading;

  return (
    <div className="sticky left-0 right-0 bottom-2 z-20 px-2">
      <div ref={barRef} className="relative max-w-xs mx-auto overflow-hidden">
        <AnimatePresence initial={false}>
          {showConfirmRemove && (
            <motion.div
              key="confirm-remove"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0 mb-2 w-full"
            >
              <Button
                variant="secondary"
                disabled={saving || sessionLoading}
                className="w-full !bg-red-600 rounded-md"
                onClick={async () => {
                  if (!user?.email) return;
                  setSaving(true);
                  try {
                    // Optimistic UI: fade out confirmation immediately.
                    setConfirmingRemove(false);
                    setSavedState('not_saved');
                    await BackendAPI.removeSavedEvent(user.email, eventId);
                    showSuccess('Event borttaget ur din kalender.');
                  } catch (e) {
                    const message =
                      e instanceof Error ? e.message : 'Failed to remove event';
                    showError(message);
                    setConfirmingRemove(true);
                    setSavedState('saved');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Ta bort markering
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onMouseEnter={() => {
            if (savedState === 'saved' && !confirmingRemove) {
              setHoveringSaved(true);
            }
          }}
          onMouseLeave={() => setHoveringSaved(false)}
          className="w-full"
        >
          <Button
            variant="primary"
            disabled={sessionLoading || saving}
            className="w-full flex items-center justify-center"
            onClick={async () => {
              if (!user?.email) return;

              if (savedState === 'saved') {
                if (confirmingRemove) {
                  // Two-step removal: cancel confirmation.
                  setConfirmingRemove(false);
                  return;
                }

                // Two-step removal: reveal confirmation button above.
                setConfirmingRemove(true);
                return;
              }

              setSaving(true);
              try {
                await BackendAPI.saveSavedEvent(user.email, eventId);
                setSavedState('saved');
                showSuccess('Event sparad i din kalender.');
              } catch (e) {
                const message =
                  e instanceof Error ? e.message : 'Failed to save event';
                setSavedState('not_saved');
                showError(message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={mainLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="whitespace-nowrap"
              >
                {mainLabel}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
