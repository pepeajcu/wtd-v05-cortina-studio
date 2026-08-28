import { buildWhatsAppUrl, cn } from '@/lib/utils';
import { FadeIn } from '@/components/motion/FadeIn';
import { FadeInStagger } from '@/components/motion/FadeInStagger';
import { WhatsAppCtaLink } from '@/components/ui/WhatsAppCtaLink';
import { getIcon } from '@/lib/iconMap';
import type { BenefitItem } from '@/lib/products';

interface ProductBenefitsProps {
  title: string;
  items: BenefitItem[];
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLabel: string;
}

export function ProductBenefits({
  title,
  items,
  whatsappNumber,
  whatsappMessage,
  whatsappLabel,
}: ProductBenefitsProps) {
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <section
      id="beneficios"
      aria-labelledby="product-benefits-heading"
      className="bg-secondary/20 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Características y beneficios
          </p>
          <h2
            id="product-benefits-heading"
            className="font-sans text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance lg:text-4xl"
          >
            {title}
          </h2>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="mt-14">
          <FadeInStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {items.map((item) => (
              <div
                key={item.title}
                className={cn(
                  'flex h-full flex-col rounded-2xl bg-background p-7',
                  'border border-border/60 shadow-soft',
                  'transition-all duration-300 ease-premium hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-medium',
                )}
              >
                <span
                  aria-hidden="true"
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/40 text-2xl"
                >
                  {item.emoji}
                </span>
                <h3 className="mb-2 font-sans text-base font-semibold leading-snug text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {item.description}
                </p>
              </div>
            ))}
          </FadeInStagger>
        </div>

        <FadeIn className="mt-12 flex justify-center lg:mt-14">
          <WhatsAppCtaLink
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            location="content"
            className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:brightness-105 hover:shadow-strong active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {whatsappLabel}
          </WhatsAppCtaLink>
        </FadeIn>
      </div>
    </section>
  );
}
