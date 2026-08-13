import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import { ProcessTitle, type WordEntry } from '@/components/motion/ProcessTitle';
import { buildWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

const PROCESS_STEPS = [
  { number: 1, key: 'step_1', icon: 'whatsapp' },
  { number: 2, key: 'step_2', icon: 'mappin' },
  { number: 3, key: 'step_3', icon: 'palette' },
  { number: 4, key: 'step_4', icon: 'wrench' },
] as const;

const rotatingWordsSchema = z.array(
  z.object({
    text: z.string().min(1),
    gender: z.enum(['m', 'f']),
  }),
);

interface ProcessSectionProps {
  whatsappNumber: string;
}

export async function ProcessSection({ whatsappNumber }: ProcessSectionProps) {
  const t = await getTranslations('process');

  const rotatingWords: WordEntry[] = rotatingWordsSchema.parse(t.raw('rotating_words'));

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const CtaIcon = getIcon('whatsapp');

  return (
    <section
      id="proceso"
      aria-labelledby="process-heading"
      className="bg-background py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <ProcessTitle
            id="process-heading"
            words={rotatingWords}
            prefixM={t('title_prefix_m')}
            prefixF={t('title_prefix_f')}
            suffix={t('title_suffix')}
            className="text-3xl leading-tight tracking-tight font-sans font-semibold text-foreground text-balance lg:text-4xl"
          />
          <p className="mt-4 font-display text-base italic leading-relaxed text-foreground/50 lg:text-lg">
            {t('subtitle')}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="relative mt-20">
          {/* Horizontal Connector Line (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[1.25rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-border via-accent/25 to-border z-0"
          />

          <FadeInStagger stagger={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10">
            {PROCESS_STEPS.map((step, index) => {
              const StepIcon = getIcon(step.icon);
              return (
                <div key={step.number} className="flex flex-col items-center text-center">
                  {/* Number Circle */}
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-sans text-sm font-semibold shadow-medium ring-4 ring-background flex items-center justify-center relative z-10">
                    {step.number}
                  </div>

                  {/* Vertical Line (Mobile) */}
                  {index !== PROCESS_STEPS.length - 1 && (
                    <div className="sm:hidden h-8 w-px bg-gradient-to-b from-border to-transparent" />
                  )}

                  {/* Icon Container */}
                  <div className="mt-5 h-14 w-14 rounded-2xl bg-secondary/40 flex items-center justify-center transition-colors duration-300 hover:bg-secondary/60 group">
                    <StepIcon
                      className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.75}
                    />
                  </div>

                  <h3 className="mt-6 font-sans text-base font-semibold text-foreground">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/55 leading-relaxed">
                    {t(`steps.${step.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </FadeInStagger>
        </div>

        <FadeIn className="mt-20 flex justify-center">
          <Link
            href={whatsappUrl}
            target="_blank"
            data-gtm-event="click_whatsapp"
            data-gtm-location="process_section"
            className={cn(
              'inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-medium',
              'transition-all duration-300 ease-premium hover:bg-primary/90 hover:shadow-strong hover:-translate-y-0.5',
              'active:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
          >
            <CtaIcon className="h-5 w-5" />
            {t('cta_label')}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
