'use client';

import React, { useRef } from 'react';
import { Reel, ProjectCardLabels } from '@/components/ui/ReelCard';
import { ReelCard } from '@/components/ui/ReelCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReelsCarouselProps {
  reels: Reel[];
  labels: ProjectCardLabels;
}

export function ReelsCarousel({ reels, labels }: ReelsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ 
        left: scrollTo, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:bg-accent hover:text-accent-foreground focus:outline-none"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:bg-accent hover:text-accent-foreground focus:outline-none"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide',
          '-mx-6 px-[11vw] scroll-px-[11vw] lg:mx-0 lg:px-0 lg:scroll-px-0',
        )}
      >
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="snap-center shrink-0 w-[78vw] sm:w-[45vw] md:w-[30vw] lg:w-[20%] a-px"
          >
            <ReelCard reel={reel} labels={labels} />
          </div>
        ))}
      </div>
    </div>
  );
}
