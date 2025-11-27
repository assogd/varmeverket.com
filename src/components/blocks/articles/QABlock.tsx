import React from 'react';
import {
  RichText,
  JSXConvertersFunction,
  JSXConverters,
} from '@payloadcms/richtext-lexical/react';
import { SerializedParagraphNode } from '@payloadcms/richtext-lexical';
import { DevIndicator } from '@/components/dev/DevIndicator';
import SignatureBlock from '@/components/blocks/global/SignatureBlock';

interface QABlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any;
}

// Custom paragraph converter for QA content (filters empty paragraphs)
const qaParagraphConverter: JSXConverters<SerializedParagraphNode> = {
  paragraph: ({ node, nodesToJSX }) => {
    const text = nodesToJSX({ nodes: node.children }) as unknown;

    // Check if paragraph is empty (no text content or only whitespace/breaks)
    const isEmpty = (text as never) === '' || !text;

    // Return null for empty paragraphs to prevent rendering
    if (isEmpty) {
      return null;
    }

    return <p>{text as React.ReactNode}</p>;
  },
};

// JSX Converter for signature blocks in QA content
const qaConverter: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...qaParagraphConverter,
  blocks: {
    signature: ({ node }: { node: { fields: { text: unknown } } }) => (
      <SignatureBlock text={node.fields.text as string} />
    ),
  },
});

export default function QABlock({ question, answer }: QABlockProps) {
  return (
    <div className="relative max-w-2xl w-full mx-auto px-4 grid gap-2 pt-3 first:pt-0">
      <DevIndicator componentName="QABlock" />
      <RichText
        data={question}
        className="hyphens-auto"
        converters={qaConverter}
      />
      <RichText
        data={answer}
        className="hyphens-auto"
        converters={qaConverter}
      />
    </div>
  );
}
