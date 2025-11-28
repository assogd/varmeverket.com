'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import CarouselSlide from '@/components/blocks/CarouselSlide';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';

interface CarouselBlockProps {
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
  slides?: Array<{
    id?: string;
    title?: string;
    content?: unknown;
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    variant?: 'default' | 'hidden';
    [key: string]: unknown;
  }>;
  showArrows?: boolean;
}

const CarouselBlock: React.FC<CarouselBlockProps> = ({
  headline,
  description,
  slides = [],
  showArrows = false,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  React.useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());

    emblaApi.on('select', () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!emblaApi) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        emblaApi.scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        emblaApi.scrollNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className="relative py-8">
      <DevIndicator componentName="CarouselBlock" position="top-left" />
      <BlockHeader headline={headline} description={description} />

      {/* Main Content */}
      <div className="mt-8">
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="embla__slide flex-[0_0_100%] min-w-0 h-full"
              >
                <CarouselSlide {...slide} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons and dots */}
        {slides.length > 1 && (
          <div className="mx-4 flex justify-center items-center gap-4 mt-6">
            {showArrows && (
              <button
                onClick={scrollPrev}
                className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Dots indicator */}
            <div className="flex gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2 h-2 rounded-full border border-text transition-colors ${
                    index === selectedIndex ? 'bg-text' : 'hover:bg-text'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {showArrows && (
              <button
                onClick={scrollNext}
                className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Next slide"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarouselBlock;
