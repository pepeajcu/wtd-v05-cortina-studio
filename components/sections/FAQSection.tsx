import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { FadeIn } from '@/components/motion/FadeIn';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { FAQCarousel } from '@/components/sections/FAQCarousel';
import { buildWhatsAppUrl, cn } from '@/lib/utils';

interface FAQSectionProps {
  whatsappNumber: string;
}

export async function FAQSection({ whatsappNumber }: FAQSectionProps) {
  const t = await getTranslations('faq');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('bottom_cta_message'));

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-secondary/25 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t('eyebrow')}
          </p>
          <h2
            id="faq-heading"
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

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <FadeIn direction="left" className="lg:col-span-7 xl:col-span-7">
            <FAQAccordion />
          </FadeIn>

          <FadeIn direction="right" className="lg:col-span-5 xl:col-span-5">
            <div className="lg:sticky lg:top-28">
              <FAQCarousel whatsappNumber={whatsappNumber} />
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mt-20 flex justify-center">
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-medium',
              'transition-all duration-300 ease-premium hover:bg-primary/90 hover:shadow-strong hover:-translate-y-0.5',
              'active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            )}
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
            {t('bottom_cta_label')}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
