/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';
import {
  QABlock,
  ImageBlock,
  ArticleCTABlock,
} from '@/components/blocks/articles';
import TextBlock from '@/components/blocks/TextBlock';
import VideoBlock from '@/components/blocks/VideoBlock';
import SignatureBlock from '@/components/blocks/global/SignatureBlock';
import { LogotypeWall } from '@/components/blocks/pages/logotypeWall';
import { PartnerCard } from '@/components/blocks/PartnerCard';
import Model3DBlock from '@/components/blocks/Model3DBlock';
import SimpleCarouselBlock from '@/components/blocks/SimpleCarouselBlock';
import CardGridBlock from '@/components/blocks/pages/cardGrid/CardGridBlock';

export const blockConverters = {
  textBlock: ({ node }: any) => (
    <TextBlock
      content={node.fields.content}
      variant={node.fields.variant || 'default'}
    />
  ),
  image: ({ node }: any) => (
    <ImageBlock image={node.fields.image} caption={node.fields.caption} />
  ),
  video: ({ node }: any) => (
    <VideoBlock
      host={node.fields.host}
      sources={node.fields.sources}
      autoplay={node.fields.autoplay}
      controls={node.fields.controls}
      adaptiveResolution={node.fields.adaptiveResolution}
    />
  ),
  cta: ({ node }: any) => (
    <ArticleCTABlock
      headline={node.fields.headline}
      ctaType={node.fields.ctaType}
      description={node.fields.description}
      link={node.fields.link}
    />
  ),
  qa: ({ node }: any) => (
    <QABlock question={node.fields.question} answer={node.fields.answer} />
  ),
  'logotype-wall': ({ node }: any) => (
    <LogotypeWall
      headline={node.fields.headline}
      description={node.fields.description}
      partners={node.fields.partners}
    />
  ),
  'partner-block': ({ node }: any) => (
    <PartnerCard
      title={node.fields.title}
      image={node.fields.image}
      url={node.fields.url}
    />
  ),
  '3D': ({ node }: any) => (
    <Model3DBlock
      model={node.fields.model}
      autoRotate={node.fields.autoRotate}
      autoRotateSpeed={node.fields.autoRotateSpeed}
      aspectRatio={node.fields.aspectRatio}
      height={node.fields.height} // Legacy field for backward compatibility
    />
  ),
  signature: ({ node }: any) => <SignatureBlock text={node.fields.text} />,
  minimalCarousel: ({ node }: any) => (
    <SimpleCarouselBlock
      aspectRatio={node.fields.aspectRatio}
      assets={node.fields.assets}
    />
  ),
  'card-grid': ({ node }: any) => (
    <CardGridBlock
      cards={node.fields.cards}
      backgroundColor={node.fields.backgroundColor}
    />
  ),
};
