'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Overlay } from '@/components/ui';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { fixImageUrl } from '@/utils/imageUrl';
import { articleConverter } from '@/utils/richTextConverters/index';
import Image from 'next/image';
import { TagList } from '@/components/ui';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface ArticleOverlayProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    introduction?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    content?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    featuredImage?: {
      id: string;
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    tags?: Array<{
      id: string;
      name: string;
    }>;
    author?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      bylineDescription?: string;
    };
    publishedDate?: string;
    lastModifiedDate?: string;
  };
  onClose: () => void;
}

const ArticleOverlay: React.FC<ArticleOverlayProps> = ({
  article,
  onClose,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    container: scrollRef,
  });

  const scale = useTransform(scrollY, [0, 150], [0.96, 1]);

  useEffect(() => {
    const articleUrl = `/artikel/${article.slug}`;
    const originalUrl = window.location.pathname;

    // Push the article URL to history
    window.history.pushState({ modal: true }, '', articleUrl);

    // Handle back button
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.modal) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Restore original URL when overlay closes
      if (window.location.pathname === articleUrl) {
        window.history.replaceState(null, '', originalUrl);
      }
    };
  }, [article.slug, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Overlay
      isOpen={true}
      onClose={onClose}
      componentName="ArticleOverlay"
      closeOnOutsideClick={true}
      backgroundClassName="bg-backdrop"
    >
      <div
        ref={scrollRef}
        className="relative w-full h-full overflow-y-auto px-2 md:px-6"
        onClick={e => e.stopPropagation()}
      >
        <DevIndicator componentName="ArticleOverlay" />

        {/* Article Content */}
        <motion.div
          data-content-type="article"
          className="relative min-h-[160vh] w-full grid gap-24 pb-36 pt-12 sm:pt-24 md:pt-36 bg-surface mx-auto mt-24 md:mt-36 max-w-6xl px-4 md:px-8 mb-36"
          style={{
            scale,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Article Header */}
          <div className="relative">
            <div className="grid gap-6 justify-center pt-8 text-center px-4">
              {/* Tags */}
              <TagList tags={article.tags} size="md" className="mb-4" />

              {/* Title */}
              <h2 className="text-xl font-display uppercase leading-tight">
                {article.title}
              </h2>

              {/* Introduction */}
              {article.introduction && (
                <div className="mx-auto max-w-4xl font-mono px-4">
                  <RichText
                    data={article.introduction}
                    className="grid gap-3"
                  />
                </div>
              )}

              {/* Meta Information */}
              <div className="font-mono text-sm">
                {article.author && (
                  <div className="">
                    Författare:&nbsp;
                    {article.author.firstName && article.author.lastName
                      ? `${article.author.firstName} ${article.author.lastName}`
                      : article.author.email}
                  </div>
                )}
                <div>
                  Publicerad: {formatDate(articleData.publishedDate || '')}
                </div>
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="mb-8">
                  <div className="max-h-[60vh] flex items-center justify-center">
                    <Image
                      src={fixImageUrl(article.featuredImage.url)}
                      alt={article.featuredImage.alt || article.title}
                      width={article.featuredImage.width || 1200}
                      height={article.featuredImage.height || 800}
                      className="object-contain max-h-full h-full w-auto rounded-lg object-center"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          {article.content && (
            <main className="relative px-4">
              <RichText
                data={article.content}
                className="grid gap-4 justify-center pb-8"
                converters={articleConverter}
              />
            </main>
          )}

          {/* Footer */}
          <footer className="font-mono mx-auto w-full max-w-xl px-4 -mt-24">
            ———
            <div>
              Författare: &nbsp;
              {article.author?.firstName && article.author?.lastName
                ? `${article.author.firstName} ${article.author.lastName}`
                : article.author?.email}
            </div>
            <div>
              {article.lastModifiedDate
                ? `Publicerad: ${formatDate(article.lastModifiedDate)}`
                : `Publicerad: ${formatDate(article.publishedDate || '')}`}
            </div>
            {article.author?.bylineDescription && (
              <div className="mt-4">{article.author.bylineDescription}</div>
            )}
          </footer>

          <nav className="sticky bottom-0 inset-x-0 z-20 bg-gradient-to-t from-surface to-transparent p-4 h-24 flex justify-center items-end  pointer-events-none select-none">
            <button
              onClick={onClose}
              className="bg-surface bg-opacity-15 backdrop-blur-sm px-4 py-2.5 rounded-md pointer-events-auto"
            >
              Stäng
            </button>
          </nav>
        </motion.div>
      </div>
    </Overlay>
  );
};

export default ArticleOverlay;
