import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import { getIcon } from '@/lib/iconMap';

const SOLUTIONS = [
  {
    key: 'heat',
    icon: 'Thermometer',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    productSlug: 'calor',
  },
  {
    key: 'privacy',
    icon: 'EyeOff',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    productSlug: 'privacidad',
  },
  {
    key: 'noise',
    icon: 'VolumeX',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-600',
    productSlug: 'acustica',
  },
  {
    key: 'decor',
    icon: 'Sparkles',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    productSlug: 'decorativo',
  },
] as const;

export async function SolutionsSection() {
  const t = await getTranslations('solutions');

  return (
    <section
      id="soluciones"
      aria-labelledby="solutions-heading"
      className="bg-secondary/20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h2
            id="solutions-heading"
            className={cn(
              'font-sans font-semibold text-foreground text-balance',
              'text-3xl leading-tight tracking-tight',
              'lg:text-4xl',
            )}
          >
            {t('title')}
          </h2>
          <p className="mt-4 font-display text-base italic leading-relaxed text-foreground/55 lg:text-lg">
            {t('subtitle')}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="mt-14">
          <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {SOLUTIONS.map((solution) => {
              const Icon = getIcon(solution.icon);
              return (
                <Link
                  key={solution.key}
                  id={`solucion-${solution.key}`}
                  href={`/productos/${solution.productSlug}`}
                  data-gtm-event="select_content"
                  data-gtm-location="solutions_section"
                  data-gtm-label={solution.productSlug}
                  className={cn(
                    'group relative flex h-full flex-col rounded-2xl bg-background p-7',
                    'border border-border/60',
                    'shadow-soft',
                    'transition-all duration-500 ease-premium',
                    'hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    'scroll-mt-28',
                  )}
                >
                  <div
                    className={cn(
                      'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                      'mx-auto sm:mx-0',
                      'transition-transform duration-500 ease-premium group-hover:scale-110',
                      solution.iconBg,
                    )}
                  >
                    <Icon
                      className={cn('h-5 w-5', solution.iconColor)}
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="font-sans text-base font-semibold leading-snug text-foreground mb-2 flex-1">
                    {t(`cards.${solution.key}.title`)}
                  </h3>
                  <span
                    className={cn(
                      'mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent',
                      'transition-transform duration-500 ease-premium group-hover:translate-x-1',
                    )}
                  >
                    {t('cta_label')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
