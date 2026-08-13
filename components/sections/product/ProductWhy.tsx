import Link from 'next/link';
import { FadeIn } from '@/components/motion/FadeIn';
import { getIcon } from '@/lib/iconMap';
import { buildWhatsAppUrl } from '@/lib/utils';
import { ImagePlaceholder } from './ImagePlaceholder';

interface ProductWhyProps {
  title: string;
  paragraphs: string[];
  image: string | null;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLabel: string;
}

export function ProductWhy({
  title,
  paragraphs,
  image,
  whatsappNumber,
  whatsappMessage,
  whatsappLabel,
}: ProductWhyProps) {
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <section
      id="por-que"
      aria-labelledby="product-why-heading"
      className="bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Por qué elegirnos
            </p>
            <h2
              id="product-why-heading"
              className="font-sans text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance lg:text-4xl"
            >
              {title}
            </h2>
            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-foreground/65">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-gtm-event="click_whatsapp"
                data-gtm-location="product_why"
                className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:brightness-105 hover:shadow-strong active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {whatsappLabel}
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.1}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-medium"
              />
            ) : (
              <ImagePlaceholder className="aspect-[4/5] w-full" />
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
