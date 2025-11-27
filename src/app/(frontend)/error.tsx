'use client';

import React from 'react';
import { AppAction } from '@/components/ui';
import { DevIndicator } from '@/components/dev';
import { FadeInUp } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <DevIndicator componentName="Error" />

      <FadeInUp
        className="text-center max-w-2xl mx-auto font-mono grid gap-4"
        timing="normal"
      >
        <div className="">
          <h1 className="text-lg font-sans">Något gick fel</h1>
        </div>
        <p>
          Ett oväntat fel uppstod. Vi arbetar på att lösa problemet. Försök igen
          eller kontakta oss om problemet kvarstår.
        </p>
        <div className="flex flex-col gap-4 mt-4 justify-center items-center">
          <AppAction
            onClick={reset}
            asButton
            variant="primary"
            className="uppercase"
          >
            Försök igen
          </AppAction>

          <AppAction href="/" variant="minimal" className="underline uppercase">
            Tillbaka till startsidan
          </AppAction>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-8 text-center text-sm opacity-60">
            <summary className="cursor-pointer mb-2">
              Teknisk information
            </summary>
            <pre className="whitespace-pre-wrap break-words">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </FadeInUp>
    </div>
  );
}
