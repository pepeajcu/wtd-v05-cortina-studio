'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';
import { trackWhatsAppClick } from '@/lib/analytics';

const EASING = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 5000;

const SLIDES = [
  {
    src: '/images/faq/faq_guatemala_cortina_studio_1.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 1',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_2.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 2',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_3.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 3',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_4.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 4',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_5.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 5',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_6.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 6',
  },
  {
    src: '/images/faq/faq_guatemala_cortina_studio_7.webp',
    alt: 'Proyecto de cortinas Cortina Studio en Guatemala, imagen 7',
  },
];

interface FAQCarouselProps {
  whatsappNumber: string;
}

export function FAQCarousel({ whatsappNumber }: FAQCarouselProps) {
  const t = useTranslations('faq');
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (reduced || isPaused) return;
    timerRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, isPaused, reduced]);

  const whatsappMessage = t('carousel_cta_message');
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <div
      className="group/carousel relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-secondary/40">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={index}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: reduced ? 0.2 : 0.7, ease: EASING }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/55 via-primary/15 to-accent/40"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            />
          </motion.div>
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl"
        />

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full',
            'bg-black/45 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white',
            'backdrop-blur-md ring-1 ring-inset ring-white/15',
          )}
        >
          <span className="font-sans text-white">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-white/55">/</span>
          <span className="font-sans text-white/75">{String(SLIDES.length).padStart(2, '0')}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-6">
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('content')}
            aria-label={t('carousel_cta')}
            className={cn(
              'group/cta flex w-full items-center justify-center gap-3 rounded-2xl',
              'bg-gradient-to-r from-primary via-primary to-accent px-6 py-4',
              'text-sm font-semibold text-primary-foreground shadow-strong',
              'ring-1 ring-inset ring-white/15 backdrop-blur-sm',
              'opacity-0 translate-y-3 pointer-events-none',
              'transition-all duration-500 ease-premium',
              'hover:shadow-[0_12px_40px_-8px_rgba(184,155,94,0.45)] hover:brightness-110',
              'active:scale-[0.99]',
              'focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:pointer-events-auto',
              'group-hover/carousel:opacity-100 group-hover/carousel:translate-y-0 group-hover/carousel:pointer-events-auto',
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-premium group-hover/cta:scale-110">
              <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-sans tracking-tight">{t('carousel_cta')}</span>
          </Link>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={t('indicator_label')}
        className="mt-4 flex items-center justify-center gap-2"
      >
        {SLIDES.map((slide, i) => {
          const isActive = i === index;
          return (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${t('indicator_label')} ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'group/dot relative h-1.5 rounded-full transition-all duration-500 ease-premium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                isActive
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-foreground/20 hover:bg-foreground/40',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
