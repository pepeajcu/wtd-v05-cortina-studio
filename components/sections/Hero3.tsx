'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { buildWhatsAppUrl } from '@/lib/utils';
import { trackWhatsAppClick } from '@/lib/analytics';

// Imagen de fondo full-bleed elegida por el cliente. Se puede sobreescribir
// pasando la prop `image` (p. ej. desde WordPress) sin tocar el componente.
const CLIENT_HERO_IMAGE =
  'https://media.admagazine.com/photos/618a5e3ba8ad6c5249a74c4b/master/w_1600,c_limit/97551.jpg';

const EASING = [0.22, 1, 0.36, 1] as const;

interface Hero3Props {
  image?: string | null;
  whatsappNumber: string;
}

export function Hero3({ image, whatsappNumber }: Hero3Props) {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const bgImage = image || CLIENT_HERO_IMAGE;

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.2 : 0.65,
      delay: reduced ? 0 : delay,
      ease: EASING,
    },
  });

  return (
    <section
      id="hero"
      aria-labelledby="hero3-heading"
      className="relative w-full overflow-hidden bg-primary"
    >
      {/* Imagen de fondo full-bleed */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImage}
        alt={t('title')}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Scrim base: oscurece de abajo hacia arriba (legibilidad en mobile centrado) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20"
      />
      {/* Scrim extra hacia la izquierda (desktop: texto inferior-izquierda) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-black/55 via-black/10 to-transparent lg:block"
      />

      {/* Fade inferior: disuelve el hero en la siguiente seccion en lugar de cortar
          con una linea dura. Termina exactamente en el color de ProblemsSection
          (bg-secondary/20 sobre background = #D8CFC4 al 20% sobre #FDFDFC = #F6F4F1),
          NO en blanco puro, para que no se vea costura. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#F6F4F1]/50 to-[#F6F4F1] lg:h-56"
      />

      {/* Contenido: mobile centrado / desktop inferior-izquierda */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-32 text-center lg:items-start lg:justify-end lg:px-8 lg:pb-44 lg:text-left">
        <div className="max-w-2xl">
          <motion.div {...fadeUp(0)} className="mb-5">
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
              {t('eyebrow')}
            </span>
          </motion.div>

          <motion.h1
            id="hero3-heading"
            {...fadeUp(0.1)}
            className="text-balance font-sans text-4xl font-semibold leading-[1.1] tracking-tight text-primary-foreground lg:text-6xl xl:text-7xl"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            {...fadeUp(0.25)}
            className="mx-auto mt-6 max-w-xl font-display text-lg italic leading-relaxed text-primary-foreground/80 lg:mx-0 lg:text-xl"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div {...fadeUp(0.38)} className="mt-10">
            <Link
              href={whatsappUrl}
              target="_blank"
              onClick={() => trackWhatsAppClick('content')}
              className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-medium transition-all duration-300 ease-premium hover:shadow-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {t('cta_label')}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-110">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
