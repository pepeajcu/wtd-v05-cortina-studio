'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/lib/products';

const EASING = [0.22, 1, 0.36, 1] as const;

export interface GalleryLightboxLabels {
  close: string;
  prev: string;
  next: string;
  counter: string;
}

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  labels: GalleryLightboxLabels;
  onClose: () => void;
}

export function GalleryLightbox({ items, initialIndex, labels, onClose }: GalleryLightboxProps) {
  const reduced = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, goPrev, goNext]);

  const current = items[currentIndex];

  return (
    <motion.div
      key="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={labels.counter
        .replace('{current}', String(currentIndex + 1))
        .replace('{total}', String(items.length))}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.35, ease: EASING }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        key={currentIndex}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.15 : 0.45, ease: EASING }}
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 lg:p-14"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative h-full w-full">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            priority
            className="object-contain"
          />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="flex items-start justify-between p-4 sm:p-6">
          <span
            aria-live="polite"
            className="pointer-events-auto inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
          >
            {labels.counter
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(items.length))}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className={cn(
              'pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full',
              'bg-white/10 text-white backdrop-blur-md',
              'transition-all duration-300 ease-premium',
              'hover:bg-white/20 hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between p-4 sm:p-6">
          <button
            type="button"
            onClick={goPrev}
            aria-label={labels.prev}
            disabled={items.length <= 1}
            className={cn(
              'pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full',
              'bg-white/10 text-white backdrop-blur-md',
              'transition-all duration-300 ease-premium',
              'hover:bg-white/20 hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              'disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed',
            )}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={labels.next}
            disabled={items.length <= 1}
            className={cn(
              'pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full',
              'bg-white/10 text-white backdrop-blur-md',
              'transition-all duration-300 ease-premium',
              'hover:bg-white/20 hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              'disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed',
            )}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
