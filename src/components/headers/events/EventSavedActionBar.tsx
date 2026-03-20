'use client';

import React, { useEffect, useState } from 'react';
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
    <div className="fixed left-0 right-0 bottom-2 z-40 px-2">
      <div className="max-w-xl mx-auto space-y-2">
        {showConfirmRemove && (
          <Button
            variant="outline"
            disabled={saving || sessionLoading}
            className="w-full !border-red-600 !text-red-600 hover:!bg-red-600/10"
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
        )}

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
