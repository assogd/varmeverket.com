import React from 'react';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import AssetTextBlock from '@/components/blocks/AssetTextBlock';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { type LinkGroup } from '@/utils/linkRouter';

interface AssetTextContainerBlockProps {
  headline?: string;
  description?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  assetTextBlocks: Array<{
    blockType: 'assetText';
    asset: {
      type: 'image' | 'mux' | 'video';
      image?: {
        id: string;
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
      mux?: string;
    };
    text: {
      root: {
        children: Array<{
          type: string;
          children?: Array<{
            text?: string;
            type?: string;
          }>;
        }>;
      };
    };
    textPosition: 'left' | 'right';
    link?: LinkGroup;
  }>;
}

const AssetTextContainerBlock: React.FC<AssetTextContainerBlockProps> = ({
  headline,
  description,
  assetTextBlocks,
}) => {
  return (
    <div className="px-2 relative">
      <DevIndicator componentName="AssetTextContainerBlock" />

      {/* Block Header */}
      <BlockHeader
        headline={headline}
        description={description}
        className="mb-12"
      />

      {/* Asset Text Blocks */}
      <hr />
      <div className="divide-y divide-text">
        {assetTextBlocks?.map((block, index) => (
          <AssetTextBlock
            key={index}
            asset={block.asset}
            text={block.text}
            textPosition={block.textPosition}
            link={block.link}
            variant="inline"
          />
        ))}
      </div>
      <hr />
    </div>
  );
};

export default AssetTextContainerBlock;
