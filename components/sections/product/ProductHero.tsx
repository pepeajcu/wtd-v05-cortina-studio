'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

const EASING = [0.22, 1, 0.36, 1] as const;

interface ProductHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string | null;
  whatsappNumber: string;
  whatsappMessage: string;
}

export function ProductHero({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  image,
  whatsappNumber,
  whatsappMessage,
}: ProductHeroProps) {
  const reduced = useReducedMotion();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);
  const WhatsAppIcon = getIcon('whatsapp');

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.2 : 0.6,
      delay: reduced ? 0 : delay,
      ease: EASING,
    },
  });

  return (
    <section
      id="hero"
      aria-labelledby="product-hero-heading"
      className="relative w-full overflow-hidden bg-primary"
    >
      {/* Fondo: imagen del producto cuando exista; mientras tanto, un degradado
          de marca para que el hero luzca intencional sin la foto. */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#2c352e]"
        />
      )}

      {/* Scrims para legibilidad */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-black/55 via-black/10 to-transparent lg:block"
      />

      {/* Contenido: mobile centrado / desktop inferior-izquierda.
          Mas bajo que el hero de portada (Hero2 usa 100dvh). */}
      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 pb-16 pt-36 text-center lg:min-h-[66vh] lg:items-start lg:justify-end lg:px-8 lg:pb-20 lg:text-left">
        <div className="max-w-2xl">
          <motion.div {...fadeUp(0)} className="mb-5">
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h1
            id="product-hero-heading"
            {...fadeUp(0.1)}
            className="text-balance font-sans text-3xl font-semibold leading-[1.12] tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
          >
            {title}
          </motion.h1>

          <motion.p
            {...fadeUp(0.22)}
            className="mx-auto mt-5 max-w-xl font-sans text-xs font-light leading-relaxed text-primary-foreground/80 lg:mx-0 lg:text-sm"
          >
            {subtitle}
          </motion.p>

          <motion.div {...fadeUp(0.34)} className="mt-9">
            <Link
              href={whatsappUrl}
              target="_blank"
              className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-medium ring-1 ring-white/15 transition-all duration-300 ease-premium hover:shadow-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {ctaLabel}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-110">
                <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
