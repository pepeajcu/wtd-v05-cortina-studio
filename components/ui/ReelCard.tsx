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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12.525.02c-1.31-.02-2.61.14-3.82.47-.32.14-.64.33-.94.56-.54.43-1.1.9-1.62 1.44-.5.5-.93 1.04-1.3 1.62-.54.54-1.02 1.12-1.45 1.72-.43.6-.8 1.25-1.1 1.92-.3.67-.55 1.37-.75 2.08-.2.71-.35 1.44-.45 2.18-.1.74-.15 1.48-.15 2.23 0 .75.05 1.5.15 2.24.1.74.25 1.48.45 2.18.2.67.45 1.26.75 1.84.3.58.64 1.14 1.02 1.65.38.52.82 1.02 1.3 1.48.48.46 1.02.87 1.6 1.22.58.35 1.22.64 1.9 0.87 0.68.23 1.38.41 2.08.54.7.13 1.42.2 2.14.2.72 0 1.44-.07 2.16-.2.72-.13 1.44-.31 2.08-.54.64-.23 1.22-.52 1.72-.87.5-.35.94-.74 1.3-1.22.36-.48.67-.98 0.94-1.48.27-.5.54-1.02.75-1.57.21-.55.35-1.12.45-1.68.1-.56.15-1.13.15-1.7.00-.57-.05-1.13-.15-1.7-.1-.57-.25-1.13-.45-1.68-.2-.55-.45-1.02-.75-1.48-.3-.46-.64-.92-1.02-1.35-.38-.43-.82-.84-1.3-1.22-.48-.38-1.02-.74-1.6-1.08-.58-.34-1.22-.63-1.9-.87-.68-.24-1.38-.41-2.08-.54-.7-.13-1.42-.2-2.14-.2-.72 0-1.44.07-2.16.2-.72.13-1.44.31-2.08.54-.64.23-1.22.52-1.72.87-.5.35-.94.74-1.3 1.22-.36.48-.67.98-.94 1.48-.27.5-.54 1.02-.75 1.57-.21.55-.35 1.12-.45 1.68-.1.56-.15 1.13-.15 1.7 0 .57.05 1.13.15 1.7.1.74.25 1.48.45 2.18.2.67.45 1.26.75 1.84.3.58.64 1.14 1.02 1.65.38.52.82 1.02 1.3 1.48.48.46 1.02.87 1.6 1.22.58.35 1.22.64 1.9 0.87 0.68.23 1.38.41 2.08.54.7.13 1.42.2 2.14.2z" />
  </svg>
);

export function ReelCard({ reel, labels }: ReelCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting && !reduced) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
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
        {/* Video Element */}
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoError(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-700',
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Loading Placeholder */}
        {!isVideoLoaded && !isVideoError && (
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
            'md:opacity-0 md:group-hover/card:opacity-100',
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
            'translate-y-full group-hover/card:translate-y-0',
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
          {labels.solution_label}
        </p>
        <p className="font-display italic text-sm leading-relaxed text-foreground/60">
          {reel.project.solutionSummary}
        </p>
      </div>
    </div>
  );
}
