'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/buttons/Button';

export type MultiStepOutcome =
  | { action: 'next' }
  | { action: 'prev' }
  | { action: 'stay' };

export type MultiStepButtonVariant = 'primary' | 'secondary' | 'outline';

export type MultiStepConfirmStep = {
  id: string;
  primary: {
    label: string;
    variant?: MultiStepButtonVariant;
    className?: string;
    onPrimary: () => Promise<MultiStepOutcome> | MultiStepOutcome;
    disabled?: boolean;
    onHoverChange?: (isHovering: boolean) => void;
  };
};

interface MultiStepConfirmButtonProps {
  steps: Array<MultiStepConfirmStep>;
  containerClassName?: string;
  innerClassName?: string;
  outsideClickToDismiss?: boolean;
  outsideClickDismissToStepIndex?: number;
  initialStepIndex?: number;
  wrapForward?: boolean;
  slideDurationMs?: number;
}

export function MultiStepConfirmButton({
  steps,
  containerClassName,
  innerClassName,
  outsideClickToDismiss = true,
  outsideClickDismissToStepIndex = 0,
  initialStepIndex = 0,
  wrapForward = false,
  slideDurationMs = 250,
}: MultiStepConfirmButtonProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const stepsLen = steps.length;
  const safeInitialIndex = Math.max(
    0,
    Math.min(initialStepIndex, stepsLen - 1)
  );
  const safeOutsideDismissIndex = Math.max(
    0,
    Math.min(outsideClickDismissToStepIndex, stepsLen - 1)
  );

  const [buttonHeight, setButtonHeight] = useState<number>(0);
  const [isSliding, setIsSliding] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);

  // Logical active step index.
  const [stepIndex, setStepIndex] = useState(safeInitialIndex);
  // Render index may point at the wrap-forward clone.
  const [renderIndex, setRenderIndex] = useState(safeInitialIndex);

  const effectiveSteps = useMemo(() => {
    if (!wrapForward || stepsLen <= 1) return steps;
    return [...steps, steps[0]];
  }, [steps, stepsLen, wrapForward]);

  const measure = useCallback(() => {
    if (!measureRef.current) return;
    const rect = measureRef.current.getBoundingClientRect();
    if (rect.height > 0) setButtonHeight(rect.height);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (isPositionInitialized) return;
    if (buttonHeight <= 0) return;
    setIsPositionInitialized(true);
  }, [buttonHeight, isPositionInitialized]);

  // Outside-click dismissal: return to configured baseline step.
  useEffect(() => {
    if (!outsideClickToDismiss) return;

    const onPointerDown = (e: PointerEvent) => {
      if (stepIndex === safeOutsideDismissIndex) return;
      if (isSliding) return;

      const el = viewportRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;

      if (!el.contains(target)) {
        setDisableTransition(false);
        setIsSliding(true);
        setStepIndex(safeOutsideDismissIndex);
        setRenderIndex(safeOutsideDismissIndex);
        window.setTimeout(() => setIsSliding(false), slideDurationMs);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [
    outsideClickToDismiss,
    safeOutsideDismissIndex,
    stepIndex,
    isSliding,
    slideDurationMs,
  ]);

  const currentStep = steps[stepIndex];
  if (!currentStep) return null;

  const translateY = buttonHeight ? -renderIndex * buttonHeight : 0;
  const shouldAnimateTransform =
    !disableTransition && isPositionInitialized && buttonHeight > 0;

  const onPrimaryClick = async () => {
    if (isSliding) return;

    const outcome = await currentStep.primary.onPrimary();
    if (outcome.action === 'stay') return;

    if (outcome.action === 'prev') {
      const next = Math.max(0, stepIndex - 1);
      setDisableTransition(false);
      setIsSliding(true);
      setStepIndex(next);
      setRenderIndex(next);
      window.setTimeout(() => setIsSliding(false), slideDurationMs);
      return;
    }

    // 'next'
    if (stepIndex === stepsLen - 1 && wrapForward && stepsLen > 1) {
      // Wrap-forward: slide to clone, then snap back without transition.
      setDisableTransition(false);
      setIsSliding(true);
      setStepIndex(0);
      setRenderIndex(stepsLen);

      window.setTimeout(() => {
        setDisableTransition(true);
        setRenderIndex(0);
        requestAnimationFrame(() => setDisableTransition(false));
        setIsSliding(false);
      }, slideDurationMs);
      return;
    }

    const next = Math.min(stepIndex + 1, stepsLen - 1);
    setDisableTransition(false);
    setIsSliding(true);
    setStepIndex(next);
    setRenderIndex(next);
    window.setTimeout(() => setIsSliding(false), slideDurationMs);
  };

  return (
    <div className={containerClassName}>
      <div
        ref={viewportRef}
        className={clsx('overflow-hidden', innerClassName)}
        style={buttonHeight ? { height: buttonHeight } : undefined}
      >
        <div
          className={clsx('flex flex-col', isSliding && 'pointer-events-none')}
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            transition: shouldAnimateTransform
              ? `transform ${slideDurationMs}ms linear`
              : 'none',
          }}
        >
          {effectiveSteps.map((step, idx) => (
            <div
              key={`${step.id}-${idx}`}
              ref={idx === 0 ? measureRef : undefined}
              style={buttonHeight ? { height: buttonHeight } : undefined}
              className="w-full"
            >
              <Button
                variant={step.primary.variant ?? 'primary'}
                disabled={Boolean(step.primary.disabled)}
                className={clsx('w-full', step.primary.className)}
                onClick={() => void onPrimaryClick()}
              >
                <div
                  className="w-full flex items-center justify-center"
                  onMouseEnter={() => step.primary.onHoverChange?.(true)}
                  onMouseLeave={() => step.primary.onHoverChange?.(false)}
                >
                  {step.primary.label}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
