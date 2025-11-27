'use client';
import React, { useState } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface GenericCarouselProps {
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
  slides?: React.ReactNode[]; // Array of any React components
  className?: string;
}

const GenericCarousel: React.FC<GenericCarouselProps> = ({
  headline,
  description,
  slides = [],
  className = '',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const currentSlideContent = slides[currentSlide];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (!currentSlideContent) {
    return null;
  }

  return (
    <section className={`py-24 px-4 ${className} relative`}>
      <DevIndicator componentName="GenericCarousel" />
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        {headline && (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            {headline}
          </h1>
        )}
        {description && (
          <div className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#f5f5f0] rounded-2xl p-8 md:p-12 relative">
          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200"
                aria-label="Previous slide"
              >
                <svg
                  className="w-6 h-6"
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
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200"
                aria-label="Next slide"
              >
                <svg
                  className="w-6 h-6"
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
            </>
          )}

          {/* Render the current slide content */}
          <div className="min-h-[400px] flex items-center justify-center">
            {currentSlideContent}
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentSlide
                  ? 'bg-text'
                  : 'bg-white border border-text hover:bg-gray-200'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default GenericCarousel;
