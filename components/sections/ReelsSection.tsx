import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FadeIn } from '@/components/motion/FadeIn';
import { Reel } from '@/components/ui/ReelCard';
import { ReelsCarousel } from '@/components/sections/ReelsCarousel';
import { buildWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

/**
 * REELS CONFIGURATION
 * -------------------
 * To add a new reel:
 * 1. Place the vertical MP4 file in /public/videos/ (recommended: H.264, < 5MB, 1080x1920).
 * 2. Add a new entry to the REELS array below.
 * 3. Optional: Add a .jpg poster in /public/videos/ for faster initial paint.
 */
const REELS: Reel[] = [
  {
    id: 'reel-1',
    src: '/videos/projeto-1.mp4',
    poster: '/videos/projeto-1-poster.jpg',
    alt: 'Transformación de sala con cortinas Ripplefold',
    platform: 'instagram',
    originalUrl: 'https://instagram.com/p/example1',
    project: {
      spaceType: 'Sala Principal',
      clientProblem: 'Exceso de luz solar y falta de privacidad',
      solution: 'Cortinas Ripplefold con tela blackout y traslucida',
      benefit: 'Control total de luz y ambiente sofisticado',
      solutionSummary: 'Elegancia fluida que protege la privacidad sin sacrificar la luz natural.'
    }
  },
  {
    id: 'reel-2',
    src: '/videos/projeto-2.mp4',
    poster: '/videos/projeto-2-poster.jpg',
    alt: 'Instalación de enrollables en dormitorio',
    platform: 'tiktok',
    originalUrl: 'https://tiktok.com/@example/video/1',
    project: {
      spaceType: 'Dormitorio Master',
      clientProblem: 'Ruido exterior y dificultad para dormir',
      solution: 'Enrollables Duo (Día y Noche) con tejido acústico',
      benefit: 'Descanso profundo y control preciso de la luminosidad',
      solutionSummary: 'Silencio y oscuridad diseñados para un descanso reparador.'
    }
  },
  {
    id: 'reel-3',
    src: '/videos/projeto-3.mp4',
    poster: '/videos/projeto-3-poster.jpg',
    alt: 'Cortinas en comedor minimalista',
    platform: 'instagram',
    originalUrl: 'https://instagram.com/p/example3',
    project: {
      spaceType: 'Comedor',
      clientProblem: 'Espacio frío y sin personalidad',
      solution: 'Cortinas de lino natural en tonos neutros',
      benefit: 'Calidez visual y ambiente acogedor',
      solutionSummary: 'Simplicidad orgánica que transforma el comedor en un hogar.'
    }
  },
  {
    id: 'reel-4',
    src: '/videos/projeto-4.mp4',
    poster: '/videos/projeto-4-poster.jpg',
    alt: 'Cenefas decorativas en cocina',
    platform: 'tiktok',
    originalUrl: 'https://tiktok.com/@example/video/4',
    project: {
      spaceType: 'Cocina',
      clientProblem: 'Ventanas pequeñas y descuidadas',
      solution: 'Cenefas personalizadas con diseño moderno',
      benefit: 'Estética pulida y mayor funcionalidad',
      solutionSummary: 'Detalles que marcan la diferencia en el corazón del hogar.'
    }
  },
  {
    id: 'reel-5',
    src: '/videos/projeto-5.mp4',
    poster: '/videos/projeto-5-poster.jpg',
    alt: 'Ripplefold en oficina ejecutiva',
    platform: 'instagram',
    originalUrl: 'https://instagram.com/p/example5',
    project: {
      spaceType: 'Oficina',
      clientProblem: 'Reflejos molestos en pantallas y falta de privacidad',
      solution: 'Cortinas Ripplefold con tejido técnico',
      benefit: 'Productividad optimizada y entorno profesional',
      solutionSummary: 'Funcionalidad técnica envuelta en un diseño ejecutivo.'
    }
  },
  {
    id: 'reel-6',
    src: '/videos/projeto-6.mp4',
    poster: '/videos/projeto-6-poster.jpg',
    alt: 'Enrollables en terraza cerrada',
    platform: 'tiktok',
    originalUrl: 'https://tiktok.com/@example/video/6',
    project: {
      spaceType: 'Terraza',
      clientProblem: 'Calor extremo y entrada de polvo',
      solution: 'Enrollables de exterior resistentes al clima',
      benefit: 'Espacio utilizable todo el año',
      solutionSummary: 'Protección total sin perder la vista al exterior.'
    }
  },
  {
    id: 'reel-7',
    src: '/videos/projeto-7.mp4',
    poster: '/videos/projeto-7-poster.jpg',
    alt: 'Cortinas Pliegue Francés en estudio',
    platform: 'instagram',
    originalUrl: 'https://instagram.com/p/example7',
    project: {
      spaceType: 'Estudio de Arte',
      clientProblem: 'Necesidad de luz difusa y control de sombras',
      solution: 'Cortinas Pliegue Francés en blanco puro',
      benefit: 'Iluminación perfecta para crear',
      solutionSummary: 'Luz suave y difusa que potencia la creatividad.'
    }
  }
];

export async function ReelsSection() {
  const tReels = await getTranslations('reels');
  const tCard = await getTranslations('projectCard');

  const cardLabels = {
    space_label: tCard('space_label'),
    problem_label: tCard('problem_label'),
    solution_label: tCard('solution_label'),
    benefit_label: tCard('benefit_label'),
    info_open: tCard('info_open'),
    info_close: tCard('info_close'),
  };

  const whatsappMessage = tReels('cta_whatsapp_message');
  const whatsappUrl = buildWhatsAppUrl('502XXXXXXXX', whatsappMessage);

  return (
    <section
      id="proyectos"
      aria-labelledby="reels-heading"
      className="bg-primary py-24 lg:py-32 text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {tReels('eyebrow')}
          </p>
          <h2
            id="reels-heading"
            className={cn(
              'font-sans font-semibold text-balance',
              'text-3xl leading-tight tracking-tight',
              'lg:text-4xl',
            )}
          >
            {tReels('title')}
          </h2>
          <p className="mt-4 font-display text-base italic leading-relaxed text-primary-foreground/55 lg:text-lg">
            {tReels('subtitle')}
          </p>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
        </FadeIn>

        <div className="mt-14">
          <ReelsCarousel reels={REELS} labels={cardLabels} />
        </div>

        <FadeIn>
          <div className="mt-20 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <p className="text-lg font-medium leading-relaxed text-primary-foreground/90 mb-8">
              {tReels('cta_text')}
            </p>
            <Link
              href={whatsappUrl}
              target="_blank"
              className="inline-flex items-center gap-3 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:brightness-105 hover:shadow-strong hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5" />
              {tReels('cta_button')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
