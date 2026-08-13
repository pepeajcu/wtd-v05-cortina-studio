'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { GalleryAspect, GalleryItem } from '@/lib/products';
import { GalleryLightbox, type GalleryLightboxLabels } from './GalleryLightbox';

const EASING = [0.22, 1, 0.36, 1] as const;
const STAGGER_STEP = 0.08;
const STAGGER_MAX = 0.4;
const INITIAL_VISIBLE = 6;

interface ProductGalleryProps {
  gallery: GalleryItem[];
}

function aspectToRatio(aspect: GalleryAspect): string {
  switch (aspect) {
    case 'square':
      return '1 / 1';
    case 'portrait':
      return '3 / 4';
    case 'landscape':
      return '4 / 3';
    case 'wide':
      return '16 / 9';
    case 'tall':
      return '9 / 16';
  }
}

export function ProductGallery({ gallery }: ProductGalleryProps) {
  const t = useTranslations('productGallery');
  const reduced = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  if (gallery.length === 0) return null;

  const labels: GalleryLightboxLabels = {
    close: t('lightbox_close'),
    prev: t('lightbox_prev'),
    next: t('lightbox_next'),
    counter: t('lightbox_counter'),
  };

  const visibleItems = expanded ? gallery : gallery.slice(0, INITIAL_VISIBLE);
  const hiddenCount = gallery.length - visibleItems.length;

  return (
    <section
      id="galeria"
      aria-labelledby="product-gallery-heading"
      className="bg-primary py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-64px' }}
          transition={{ duration: reduced ? 0.2 : 0.6, ease: EASING }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h2
            id="product-gallery-heading"
            className="font-sans text-3xl font-semibold leading-tight tracking-tight text-primary-foreground text-balance lg:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/55">
            {t('subtitle')}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </motion.div>

        <div
          id="product-gallery-grid"
          className="mt-14 columns-1 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={`${item.src}-${index}`}
                layout
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{
                  duration: reduced ? 0.2 : 0.55,
                  delay: reduced || !expanded
                    ? 0
                    : Math.min(Math.max(index - INITIAL_VISIBLE + 1, 0) * STAGGER_STEP, STAGGER_MAX),
                  ease: EASING,
                }}
                className="mb-4 break-inside-avoid"
              >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={t('open_image', { alt: item.alt, index: index + 1, total: gallery.length })}
                data-gtm-event="select_item"
                data-gtm-location="product_gallery"
                data-gtm-label={item.alt}
                className={cn(
                  'group relative block w-full overflow-hidden rounded-2xl bg-primary-foreground/10',
                  'ring-1 ring-primary-foreground/10 shadow-soft',
                  'transition-all duration-500 ease-premium',
                  'hover:shadow-medium hover:ring-accent/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
                )}
                style={{ aspectRatio: aspectToRatio(item.aspect) }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={cn(
                    'object-cover',
                    'transition-transform duration-[700ms] ease-premium',
                    'will-change-transform',
                    'scale-110 group-hover:scale-100',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent',
                    'opacity-0 transition-opacity duration-500 ease-premium',
                    'group-hover:opacity-100',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full',
                    'bg-white/85 text-foreground shadow-soft backdrop-blur-md',
                    'opacity-0 translate-y-1 transition-all duration-500 ease-premium',
                    'group-hover:opacity-100 group-hover:translate-y-0',
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                </span>
              </button>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {gallery.length > INITIAL_VISIBLE && (
          <div className="mt-10 flex justify-center">
            <button
              ref={toggleButtonRef}
              type="button"
              onClick={() => {
                const wasExpanded = expanded;
                setExpanded((v) => !v);
                if (wasExpanded) {
                  window.setTimeout(() => {
                    toggleButtonRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }, 400);
                }
              }}
              aria-expanded={expanded}
              aria-controls="product-gallery-grid"
              className={cn(
                'group inline-flex items-center gap-2.5 rounded-full',
                'border border-primary-foreground/15 bg-primary px-7 py-3.5',
                'text-sm font-semibold text-primary-foreground',
                'shadow-soft transition-all duration-500 ease-premium',
                'hover:border-accent/40 hover:shadow-medium hover:-translate-y-0.5',
                'active:translate-y-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
              )}
            >
              <span>{expanded ? t('load_less') : t('load_more', { count: hiddenCount })}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-500 ease-premium',
                  expanded && 'rotate-180',
                )}
                aria-hidden="true"
                strokeWidth={2}
              />
            </button>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <AnimatePresence>
          <GalleryLightbox
            key="lightbox"
            items={gallery}
            initialIndex={lightboxIndex}
            labels={labels}
            onClose={() => setLightboxIndex(null)}
          />
        </AnimatePresence>
      )}
    </section>
  );
}
