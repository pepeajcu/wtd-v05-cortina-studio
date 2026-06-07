import Link from 'next/link';
import { FadeIn } from '@/components/motion/FadeIn';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';
import type { ProductSignatureData } from '@/lib/products';
import { ImagePlaceholder } from './ImagePlaceholder';

interface ProductSignatureProps {
  signature: ProductSignatureData;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLabel: string;
}

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function ProductSignature({
  signature,
  whatsappNumber,
  whatsappMessage,
  whatsappLabel,
}: ProductSignatureProps) {
  const { eyebrow, headline, body, bullets, image, highlight, specs } = signature;
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <section
      id="firma"
      aria-labelledby="product-signature-heading"
      className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: '240px 240px' }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-32 h-80 w-80 rounded-full bg-primary-foreground/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                {eyebrow}
              </span>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h2
                id="product-signature-heading"
                className="mt-5 font-sans text-3xl font-semibold leading-[1.08] tracking-tight text-balance text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {headline}
              </h2>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="mt-5 max-w-xl font-display text-base italic leading-relaxed text-primary-foreground/70 lg:text-lg">
                {body}
              </p>
            </FadeIn>

            <div role="list" className="mt-8 space-y-3">
              {bullets.map((bullet, i) => (
                <FadeIn
                  key={i}
                  delay={0.24 + i * 0.08}
                  className="flex items-start gap-3 text-sm leading-relaxed text-primary-foreground/80 lg:text-base"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{bullet}</span>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.5} className="mt-9">
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:brightness-105 hover:shadow-strong active:translate-y-0 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                {whatsappLabel}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </span>
              </Link>
            </FadeIn>
          </div>

          <FadeIn direction="left" delay={0.1} className="lg:col-span-5">
            <div className="relative">
              <div className="rounded-[2rem] bg-primary-foreground/5 p-1.5 ring-1 ring-primary-foreground/10">
                <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={highlight.title}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      className="aspect-[4/5] w-full"
                      label={highlight.title}
                    />
                  )}
                </div>
              </div>

              <FadeIn delay={0.3} className="absolute -bottom-6 left-4 right-4 sm:-bottom-8 sm:left-6 sm:right-auto sm:max-w-[280px]">
                <div className="rounded-2xl border border-accent/25 bg-background/95 p-5 shadow-strong backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                    Detalle
                  </p>
                  <h3 className="mt-2 font-sans text-base font-semibold leading-snug text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">
                    {highlight.body}
                  </p>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="mt-24 border-t border-primary-foreground/10 pt-10 lg:mt-28">
          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0 lg:gap-0">
            {specs.map((spec, i) => (
              <FadeIn
                key={spec.label}
                delay={0.28 + i * 0.08}
                className="lg:border-l lg:border-primary-foreground/10 lg:px-8 first:lg:border-l-0 first:lg:pl-0"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/40">
                  {spec.label}
                </p>
                <p className="mt-3 font-display text-2xl leading-tight text-primary-foreground lg:text-3xl">
                  {spec.value}
                </p>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
