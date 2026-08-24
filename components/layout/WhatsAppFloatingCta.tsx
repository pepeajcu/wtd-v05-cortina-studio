'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

interface WhatsAppFloatingCtaProps {
  whatsappNumber: string;
}

const ATTENTION_INITIAL_DELAY_MS = 4_000;
const ATTENTION_INTERVAL_MS = 45_000;
const BUBBLE_VISIBLE_MS = 15_000;

export function WhatsAppFloatingCta({ whatsappNumber }: WhatsAppFloatingCtaProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimationControls();

  const [showBubble, setShowBubble] = useState(false);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const dismissBubbleAfterDelay = () => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => setShowBubble(false), BUBBLE_VISIBLE_MS);
    };

    const triggerAttention = () => {
      setShowBubble(true);
      dismissBubbleAfterDelay();
      controls.start({
        scale: [1, 1.25, 1.1, 1.2, 1],
        x: [0, -6, 6, -3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      });
    };

    const initialTimeout = setTimeout(triggerAttention, ATTENTION_INITIAL_DELAY_MS);
    const interval = setInterval(triggerAttention, ATTENTION_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    };
  }, [prefersReducedMotion, controls]);

  const dismissBubble = () => {
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setShowBubble(false);
  };

  return (
    <>
      {/* Mobile: barra sticky inferior */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/70 to-transparent"
        />
        <div className="relative flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('cta_contact')}
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-border/40 bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-strong backdrop-blur-xl transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <WhatsAppIcon className="h-3.5 w-3.5" />
            </span>
            {t('cta_contact')}
          </Link>
        </div>
      </div>

      {/* Tablet / Desktop: burbuja circular flotante */}
      <div className="fixed bottom-6 right-6 z-30 hidden md:block">
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-full right-0 mb-3 w-64"
              role="status"
            >
              <div className="relative rounded-2xl border border-border/50 bg-background px-4 py-3.5 pr-8 shadow-strong">
                <button
                  type="button"
                  onClick={dismissBubble}
                  aria-label={tCommon('close')}
                  className="absolute right-2 top-2 rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium leading-snug text-foreground hover:text-accent"
                >
                  {t('attention_bubble')}
                </Link>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-border/50 bg-background"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div animate={controls}>
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tCommon('whatsapp')}
            title={tCommon('whatsapp')}
            className="group flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-primary text-primary-foreground shadow-strong transition-all duration-300 ease-premium hover:scale-105 hover:shadow-[0_8px_32px_-4px_rgb(0_0_0_/_0.25)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <WhatsAppIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          </Link>
        </motion.div>
      </div>
    </>
  );
}
