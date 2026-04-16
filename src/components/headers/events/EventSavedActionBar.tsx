'use client';

import React, { useEffect, useState } from 'react';
import BackendAPI from '@/lib/backendApi';
import { useSession } from '@/hooks/useSession';
import { useNotification } from '@/hooks/useNotification';
import clsx from 'clsx';
import {
  MultiStepConfirmButton,
  type MultiStepConfirmStep,
} from '@/components/ui/buttons/MultiStepConfirmButton';
import { Button } from '@/components/ui/buttons/Button';

type SavedState = 'unknown' | 'saved' | 'not_saved';

interface EventSavedActionBarProps {
  eventId: string;
  hasForm?: boolean;
  externalCta?: {
    url?: string | null;
    text?: string | null;
  } | null;
}

export function EventSavedActionBar({
  eventId,
  hasForm = false,
  externalCta = null,
}: EventSavedActionBarProps) {
  const { user, loading: sessionLoading } = useSession();
  const { showError, showSuccess } = useNotification();

  const [savedState, setSavedState] = useState<SavedState>('unknown');
  const [saving, setSaving] = useState(false);
  const [hoveringSaved, setHoveringSaved] = useState(false);

  const showSaveButton = Boolean(user?.email && eventId && !hasForm);
  const externalCtaUrl = externalCta?.url?.trim() || '';
  const externalCtaLabel = externalCta?.text?.trim() || 'Läs mer';
  const showExternalCta = Boolean(externalCtaUrl);
  const showActionBar = showSaveButton || showExternalCta;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!showSaveButton) {
        setSavedState('unknown');
        setHoveringSaved(false);
        return;
      }

      setSavedState('unknown');
      setHoveringSaved(false);

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
  }, [eventId, showSaveButton, user?.email]);

  if (!showActionBar) return null;
  if (showSaveButton && savedState === 'unknown') return null;

  const initialStepIndex = savedState === 'saved' ? 0 : 2;

  // Fixed stack to guarantee slide animations within a constant buttons-height viewport.
  // Order is important:
  // - Sparad (0) -> Ta bort markering (1) -> Spara (2)
  // - Wrap-forward ensures Spara (2) -> Sparad (0) with upward linear motion.
  const steps: MultiStepConfirmStep[] = [
    {
      id: 'saved',
      primary: {
        label: hoveringSaved ? 'Ta bort markering' : 'Sparad',
        variant: 'primary',
        className: 'flex items-center justify-center',
        disabled: saving || sessionLoading,
        onPrimary: () => {
          return { action: 'next' };
        },
        onHoverChange: isHovering => setHoveringSaved(isHovering),
      },
    },
    {
      id: 'remove-confirm',
      primary: {
        label: 'Bekräfta',
        variant: 'secondary',
        className: '!bg-red-600 rounded-md flex items-center justify-center',
        disabled: saving || sessionLoading,
        onPrimary: async () => {
          if (!user?.email) return { action: 'stay' };

          setSaving(true);
          try {
            await BackendAPI.removeSavedEvent(user.email, eventId);
            setSavedState('not_saved');
            showSuccess('Event borttaget ur din kalender.');
            return { action: 'next' };
          } catch (e) {
            const message =
              e instanceof Error ? e.message : 'Failed to remove event';
            showError(message);
            return { action: 'stay' };
          } finally {
            setSaving(false);
          }
        },
      },
    },
    {
      id: 'unsaved',
      primary: {
        label: 'Spara',
        variant: 'primary',
        className: 'flex items-center justify-center',
        disabled: saving || sessionLoading,
        onPrimary: async () => {
          if (!user?.email) return { action: 'stay' };

          setSaving(true);
          try {
            await BackendAPI.saveSavedEvent(user.email, eventId);
            setSavedState('saved');
            showSuccess('Event sparad i din kalender.');
            return { action: 'next' };
          } catch (e) {
            const message =
              e instanceof Error ? e.message : 'Failed to save event';
            showError(message);
            return { action: 'stay' };
          } finally {
            setSaving(false);
          }
        },
      },
    },
  ];

  return (
    <div className="sticky left-0 right-0 bottom-12 md:bottom-2 z-20 px-2">
      <div
        className={clsx(
          'mx-auto w-full',
          showSaveButton && showExternalCta ? 'md:max-w-2xl' : 'md:max-w-xs'
        )}
      >
        <div className="grid gap-2 md:grid-cols-2">
          {showExternalCta && (
            <a
              href={externalCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                {externalCtaLabel}
              </Button>
            </a>
          )}

          {showSaveButton && (
            <MultiStepConfirmButton
              steps={steps}
              containerClassName="relative w-full"
              initialStepIndex={initialStepIndex}
              outsideClickDismissToStepIndex={initialStepIndex}
              wrapForward
              outsideClickToDismiss={!saving && !sessionLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
