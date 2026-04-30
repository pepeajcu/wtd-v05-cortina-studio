import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import { ProcessTitle, WordEntry } from '@/components/motion/ProcessTitle';
import { buildWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MapPin, Palette, Wrench } from 'lucide-react';

// Using a local WhatsAppIcon implementation since it's a project-specific component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={cn('h-6 w-6', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a//9.87 9.87 0 01-5.041-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a//9.866 9.866 0 01-2.015-5.47c.004-5.35 4.387-9.738 9.886-9.738a//9.825 9.825 0 017.005 2.945 9.8 9.8 0 012.8 7.1L22.3 16.145l-.436.653a//9.8 9.8 0 01-1.577 1.53L15.05 21.78z" />
  </svg>
);

interface Step {
  number: 1 | 2 | 3 | 4;
  Icon: React.ComponentType<any>;
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { number: 1, Icon: WhatsAppIcon, titleKey: 'step_1_title', descKey: 'step_1_desc' },
  { number: 2, Icon: MapPin, titleKey: 'step_2_title', descKey: 'step_2_desc' },
  { number: 3, Icon: Palette, titleKey: 'step_3_title', descKey: 'step_3_desc' },
  { number: 4, Icon: Wrench, titleKey: 'step_4_title', descKey: 'step_4_desc' },
];

export async function ProcessSection() {
  const t = await getTranslations('process');

  const rotatingWordsString = t('rotating_words');
  const rotatingWords: WordEntry[] = rotatingWordsString.split(',').map(item => {
    const [text, gender] = item.split(':');
    return { text, gender: gender as 'm' | 'f' };
  });

  const whatsappUrl = buildWhatsAppUrl('502XXXXXXXX', t('cta'));

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
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                {/* Number Circle */}
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-sans text-sm font-semibold shadow-medium ring-4 ring-background flex items-center justify-center relative z-10">
                  {step.number}
                </div>

                {/* Vertical Line (Mobile) */}
                {index !== STEPS.length - 1 && (
                  <div className="sm:hidden h-8 w-px bg-gradient-to-b from-border to-transparent" />
                )}

                {/* Icon Container */}
                <div className="mt-5 h-14 w-14 rounded-2xl bg-secondary/40 flex items-center justify-center transition-colors duration-300 hover:bg-secondary/60 group">
                  <step.Icon 
                    className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" 
                    strokeWidth={1.75} 
                  />
                </div>

                <h3 className="mt-6 font-sans text-base font-semibold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 text-sm text-foreground/55 leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </FadeInStagger>
        </div>

        <FadeIn className="mt-20 flex justify-center">
          <Link
            href={whatsappUrl}
            target="_blank"
            className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-medium transition-all duration-300 ease-premium hover:bg-primary/90 hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t('cta')}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
