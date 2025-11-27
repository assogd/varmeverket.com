'use client';

import React from 'react';
import { AppAction } from '@/components/ui';
import { DevIndicator } from '@/components/dev';
import { FadeInUp } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <DevIndicator componentName="NotFound" />

      <FadeInUp
        className="text-center max-w-2xl mx-auto font-mono grid gap-4"
        timing="normal"
      >
        <div className="">
          <h1 className="text-lg font-sans">Sidan kunde inte hittas</h1>
        </div>
        <p>
          Den sida du letar efter finns inte eller har flyttats. Om du tror att
          detta är ett fel, kontakta oss så hjälper vi dig.
        </p>
        <AppAction href="/" variant="minimal" className="underline uppercase">
          Tillbaka till startsidan
        </AppAction>
      </FadeInUp>
    </div>
  );
}
