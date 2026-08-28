import React from 'react';
import { getTranslations } from 'next-intl/server';
import { FadeIn } from '@/components/motion/FadeIn';
import type { Reel } from '@/components/ui/ReelCard';
import { ReelsCarousel } from '@/components/sections/ReelsCarousel';
import { WhatsAppCtaLink } from '@/components/ui/WhatsAppCtaLink';
import { buildWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';
import type { ProyectoData } from '@/lib/wordpress/getProyectos';

interface ReelsSectionProps {
  proyectos: ProyectoData[];
  whatsappNumber: string;
}

function toReel(p: ProyectoData): Reel {
  return {
    id: p.id,
    title: p.title,
    src: p.video,
    poster: p.videoPoster ?? undefined,
    alt: p.videoAlt || p.title,
    platform: p.platform === 'tiktok' ? 'tiktok' : 'instagram',
    originalUrl: p.originalUrl,
    project: {
      spaceType: p.spaceType,
      clientProblem: p.clientProblem,
      solution: p.solution,
      benefit: p.benefit,
      solutionSummary: p.solutionSummary,
    },
  };
}

export async function ReelsSection({ proyectos, whatsappNumber }: ReelsSectionProps) {
  const t = await getTranslations('reels');
  const tCard = await getTranslations('projectCard');

  const cardLabels = {
    space_label: tCard('space_label'),
    problem_label: tCard('problem_label'),
    solution_label: tCard('solution_label'),
    benefit_label: tCard('benefit_label'),
    info_open: tCard('info_open'),
    info_close: tCard('info_close'),
  };

  const reelItems = proyectos.map(toReel);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <section
      id="proyectos"
      aria-labelledby="reels-heading"
      className="bg-primary py-24 lg:py-32 text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h2
            id="reels-heading"
            className={cn(
              'font-sans font-semibold text-balance',
              'text-3xl leading-tight tracking-tight',
              'lg:text-4xl',
            )}
          >
            {t('title')}
          </h2>
          <p className="mt-4 font-display text-base italic leading-relaxed text-primary-foreground/55 lg:text-lg">
            {t('subtitle')}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="mt-14">
          <ReelsCarousel reels={reelItems} labels={cardLabels} />
        </div>

        <FadeIn>
          <div className="mt-20 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <p className="text-lg font-medium leading-relaxed text-primary-foreground/90 mb-8">
              {t('cta_text')}
            </p>
            <WhatsAppCtaLink
              href={whatsappUrl}
              target="_blank"
              location="content"
              className="inline-flex items-center gap-3 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:brightness-105 hover:shadow-strong hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t('cta_button')}
            </WhatsAppCtaLink>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
