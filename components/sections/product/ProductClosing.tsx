import { FadeIn } from '@/components/motion/FadeIn';
import { getIcon } from '@/lib/iconMap';
import { WhatsAppCtaLink } from '@/components/ui/WhatsAppCtaLink';
import { buildWhatsAppUrl } from '@/lib/utils';

interface ProductClosingProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;
}

export function ProductClosing({
  title,
  subtitle,
  ctaLabel,
  whatsappNumber,
  whatsappMessage,
}: ProductClosingProps) {
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <section
      id="cotiza"
      aria-labelledby="product-closing-heading"
      className="bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground shadow-strong lg:px-16 lg:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-accent/10"
            />
            <div className="relative">
              <h3
                id="product-closing-heading"
                className="mx-auto max-w-2xl font-sans text-2xl font-semibold leading-tight tracking-tight text-balance lg:text-3xl"
              >
                {title}
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/70">
                {subtitle}
              </p>
              <div className="mt-9 flex justify-center">
                <WhatsAppCtaLink
                  href={whatsappUrl}
                  target="_blank"
                  location="content"
                  className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:brightness-105 hover:shadow-strong active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {ctaLabel}
                </WhatsAppCtaLink>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
