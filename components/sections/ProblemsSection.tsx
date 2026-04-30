import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import { Thermometer, EyeOff, VolumeX, Sparkles } from 'lucide-react';

interface ProblemCard {
  id: string;
  Icon: React.ComponentType<any>;
  titleKey: string;
  descKey: string;
  iconBg: string;
  iconColor: string;
}

const PROBLEMS: ProblemCard[] = [
  {
    id: 'heat',
    Icon: Thermometer,
    titleKey: 'cards.heat.title',
    descKey: 'cards.heat.desc',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    id: 'privacy',
    Icon: EyeOff,
    titleKey: 'cards.privacy.title',
    descKey: 'cards.privacy.desc',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'noise',
    Icon: VolumeX,
    titleKey: 'cards.noise.title',
    descKey: 'cards.noise.desc',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-600',
  },
  {
    id: 'decor',
    Icon: Sparkles,
    titleKey: 'cards.decor.title',
    descKey: 'cards.decor.desc',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function ProblemsSection() {
  const t = useTranslations('problems');

  return (
    <section
      id="problemas"
      aria-labelledby="problems-heading"
      className="bg-secondary/20 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h2
            id="problems-heading"
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
            {PROBLEMS.map((problem) => (
              <Link
                key={problem.id}
                href="#soluciones"
                className={cn(
                  'group flex h-full flex-col rounded-2xl bg-background p-7',
                  'border border-border/60',
                  'shadow-soft',
                  'transition-all duration-300 ease-premium',
                  'hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                )}
              >
                <div
                  className={cn(
                    'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                    'transition-transform duration-300 ease-premium group-hover:scale-110',
                    problem.iconBg,
                  )}
                >
                  <problem.Icon
                    className={cn('h-5 w-5', problem.iconColor)}
                    aria-hidden="true"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-sans text-base font-semibold leading-snug text-foreground mb-2">
                  {t(problem.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/55">
                  {t(problem.descKey)}
                </p>
              </Link>
            ))}
          </FadeInStagger>
        </div>
      </div>
    </section>
  );
}
