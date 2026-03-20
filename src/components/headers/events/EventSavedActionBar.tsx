'use client';

import React, { useEffect, useState } from 'react';
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

  const [savedState, setSavedState] = useState<SavedState>('unknown');
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (!canShow) return null;

  const mainLabel =
    savedState === 'saved' ? (confirmingRemove ? 'Avbryt' : 'Sparad') : 'Spara';
  const showConfirmRemove =
    savedState === 'saved' && confirmingRemove && !saving && !sessionLoading;

  return (
    <div className="sticky left-0 right-0 bottom-2 z-20 px-2 mix-blend-multiply">
      <div className="relative max-w-xs mx-auto">
        <AnimatePresence initial={false}>
          {showConfirmRemove && (
            <motion.div
              key="confirm-remove"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 right-0 bottom-full mb-2 w-full"
            >
              <Button
                variant="secondary"
                disabled={saving || sessionLoading}
                className="w-full !bg-red-600 rounded-md"
                onClick={async () => {
                  if (!user?.email) return;
                  setSaving(true);
                  try {
                    await BackendAPI.removeSavedEvent(user.email, eventId);
                    setSavedState('not_saved');
                    setConfirmingRemove(false);
                    showSuccess('Event borttaget ur din kalender.');
                  } catch (e) {
                    const message =
                      e instanceof Error ? e.message : 'Failed to remove event';
                    showError(message);
                    setConfirmingRemove(true);
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

        <Button
          variant="primary"
          disabled={sessionLoading || saving}
          className="w-full"
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
          {mainLabel}
        </Button>
      </div>
    </div>
  );
}
