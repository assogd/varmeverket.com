import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface SignatureBlockProps {
  text: string;
}

export default function SignatureBlock({ text }: SignatureBlockProps) {
  return (
    <div className="relative text-center uppercase text-sm font-mono mb-2 tracking-wide">
      <DevIndicator componentName="SignatureBlock" />
      {text}
    </div>
  );
}
