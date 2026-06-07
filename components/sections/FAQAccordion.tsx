'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const EASING = [0.22, 1, 0.36, 1] as const;

const QUESTION_KEYS = [
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
] as const;

export function FAQAccordion() {
  const t = useTranslations('faq');
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      role="list"
      aria-label={t('list_label')}
      className="divide-y divide-border/70 border-y border-border/70"
    >
      {QUESTION_KEYS.map((key, i) => {
        const isOpen = openIndex === i;
        const questionId = `faq-question-${key}`;
        const answerId = `faq-answer-${key}`;
        return (
          <div role="listitem" key={key} className="group/row">
            <h3>
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 py-5 text-left',
                  'transition-colors duration-300 ease-premium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                )}
              >
                <span
                  className={cn(
                    'font-sans text-base font-semibold leading-snug tracking-tight lg:text-lg',
                    'transition-colors duration-300 ease-premium',
                    isOpen ? 'text-accent' : 'text-foreground group-hover/row:text-accent',
                  )}
                >
                  {t(`items.${key}.q`)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    'border transition-all duration-500 ease-premium',
                    isOpen
                      ? 'bg-accent border-accent text-accent-foreground rotate-45'
                      : 'border-border bg-background text-foreground group-hover/row:border-accent/60',
                  )}
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.2 : 0.38, ease: EASING }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-12 text-sm leading-relaxed text-foreground/65 lg:text-[15px]">
                    {t(`items.${key}.a`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
