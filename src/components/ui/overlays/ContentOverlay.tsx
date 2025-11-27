'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ShowcaseOverlay from './ShowcaseOverlay';
import ArticleOverlay from './ArticleOverlay';
import type { ContentItem } from '@/components/blocks/HighlightGridGenerator/types';

interface ContentOverlayProps {
  selectedContent: ContentItem | null;
  onClose: () => void;
}

const ContentOverlay: React.FC<ContentOverlayProps> = ({
  selectedContent,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {selectedContent && (
        <>
          {selectedContent._contentType === 'showcase' ? (
            <ShowcaseOverlay showcase={selectedContent} onClose={onClose} />
          ) : selectedContent._contentType === 'article' ? (
            <ArticleOverlay article={selectedContent} onClose={onClose} />
          ) : null}
        </>
      )}
    </AnimatePresence>
  );
};

export default ContentOverlay;
