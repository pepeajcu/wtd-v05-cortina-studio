'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectDetails {
  spaceType: string;
  clientProblem: string;
  solution: string;
  benefit: string;
  solutionSummary: string;
}

export interface Reel {
  id: string;
  title: string;
  src: string;
  poster?: string;
  alt: string;
  platform: 'instagram' | 'tiktok';
  originalUrl: string;
  project: ProjectDetails;
}

export interface ProjectCardLabels {
  space_label: string;
  problem_label: string;
  solution_label: string;
  benefit_label: string;
  info_open: string;
  info_close: string;
}

interface ReelCardProps {
  reel: Reel;
  labels: ProjectCardLabels;
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.18a8.16 8.16 0 0 0 4.77 1.52V6.34a4.79 4.79 0 0 1-1.84-.65z" />
  </svg>
);

export function ReelCard({ reel, labels }: ReelCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  // Precarga el video un poco antes de que entre al viewport, para que ya
  // tenga datos cuando el usuario llegue a la tarjeta.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    preloadObserver.observe(el);
    return () => preloadObserver.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.5 }
    );
    playObserver.observe(el);
    return () => playObserver.disconnect();
  }, [reduced]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInfoOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="group/card relative h-full w-full">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-gradient-to-b from-primary/20 to-primary/10 shadow-soft">
        {/* Poster: se ve de inmediato mientras el video carga en segundo plano */}
        {reel.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.poster}
            alt={reel.alt}
            loading="lazy"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}

        {/* Video Element: carga (src) diferida hasta acercarse al viewport */}
        <video
          ref={videoRef}
          src={shouldLoadVideo ? reel.src : undefined}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload={shouldLoadVideo ? 'auto' : 'none'}
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoError(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Loading Placeholder: solo si no hay poster disponible */}
        {!reel.poster && !isVideoLoaded && !isVideoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary/30">
            <div className="h-12 w-12 animate-pulse rounded-full bg-primary/10" />
            <div className="h-2 w-24 animate-pulse rounded-full bg-primary/10" />
          </div>
        )}

        {/* Error State */}
        {isVideoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white">
            <X className="h-8 w-8 text-red-400" />
            <p className="font-medium">Video no disponible</p>
            <p className="text-xs opacity-60">Asegúrate de colocar el MP4 en /public/videos/</p>
          </div>
        )}

        {/* Info Toggle Button */}
        <button
          onClick={() => setInfoOpen(!infoOpen)}
          aria-label={infoOpen ? labels.info_close : labels.info_open}
          className={cn(
            'absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full',
            'bg-black/40 backdrop-blur-md text-white transition-all duration-300',
            'lg:opacity-0 lg:group-hover/card:opacity-100',
            infoOpen && 'opacity-100'
          )}
        >
          {infoOpen ? <X className="h-5 w-5" /> : <Info className="h-5 w-5" />}
        </button>

        {/* Project Details Overlay */}
        <div
          className={cn(
            'absolute inset-0 z-20 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/95 via-black/60 to-transparent',
            'transition-transform duration-500 ease-premium',
            'translate-y-full lg:group-hover/card:translate-y-0',
            infoOpen && 'translate-y-0'
          )}
        >
          <dl className="space-y-4">
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-widest text-accent">{labels.space_label}</dt>
              <dd className="text-sm font-medium leading-tight">{reel.project.spaceType}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-widest text-accent">{labels.problem_label}</dt>
              <dd className="text-sm font-medium leading-tight">{reel.project.clientProblem}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-widest text-accent">{labels.solution_label}</dt>
              <dd className="text-sm font-medium leading-tight">{reel.project.solution}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-widest text-accent">{labels.benefit_label}</dt>
              <dd className="text-sm font-medium leading-tight">{reel.project.benefit}</dd>
            </div>
          </dl>
        </div>

        {/* Platform Badge */}
        <a
          href={reel.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 bottom-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-transform duration-300 hover:scale-110"
          aria-label={`View on ${reel.platform}`}
        >
          {reel.platform === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
        </a>
      </div>

      {/* Bottom Caption */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          {reel.title}
        </p>
        <p className="font-sans font-light text-xs leading-relaxed text-primary-foreground/75">
          {reel.project.solutionSummary}
        </p>
      </div>
    </div>
  );
}
