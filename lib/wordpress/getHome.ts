import { z } from 'zod';
import { wpFetch } from './client';
import { WP_TAGS } from './tags';
import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated';

function parseRepeater(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return Object.values(parsed as Record<string, unknown>);
  return [];
}

const problemCardSchema = z
  .object({
    key: z.string().min(1),
    title: z.string().default(''),
    description: z.string().default(''),
    icon: z.string().default(''),
  })
  .passthrough();

const reelSelectedSchema = z
  .object({
    slug: z.string().min(1).optional(),
    id: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const rotatingWordSchema = z
  .object({ word: z.string().min(1) })
  .passthrough();

const processStepSchema = z
  .object({
    number: z.coerce.number().int().min(1).max(4),
    title: z.string().default(''),
    description: z.string().default(''),
    icon: z.string().default(''),
  })
  .passthrough();

export type ProblemCardData = z.infer<typeof problemCardSchema>;
export type ReelSelectedData = z.infer<typeof reelSelectedSchema>;
export type RotatingWordData = z.infer<typeof rotatingWordSchema>;
export type ProcessStepData = z.infer<typeof processStepSchema>;

export interface HomeData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string | null;
    imageCaption: string;
    ctaLabel: string;
    ctaMessage: string;
  };
  problems: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: ProblemCardData[];
  };
  reels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    selected: ReelSelectedData[];
    ctaText: string;
    ctaButton: string;
    whatsappMessage: string;
  };
  process: {
    eyebrow: string;
    titlePrefixM: string;
    titlePrefixF: string;
    titleSuffix: string;
    rotatingWords: RotatingWordData[];
    subtitle: string;
    ctaLabel: string;
    steps: ProcessStepData[];
  };
}

export async function getHome(): Promise<HomeData> {
  const data = await wpFetch<GetHomeQuery>(GetHomeDocument, undefined, {
    tags: [WP_TAGS.home],
  });

  const node = data.homeSingletons?.nodes?.[0];
  if (!node) {
    throw new Error('Home singleton no encontrado en WordPress');
  }

  return {
    hero: {
      eyebrow: node.heroEyebrow ?? '',
      title: node.heroTitle ?? '',
      subtitle: node.heroSubtitle ?? '',
      image: node.heroImage ?? null,
      imageCaption: node.heroImageCaption ?? '',
      ctaLabel: node.heroCtaLabel ?? '',
      ctaMessage: node.heroCtaMessage ?? '',
    },
    problems: {
      eyebrow: node.problemsEyebrow ?? '',
      title: node.problemsTitle ?? '',
      subtitle: node.problemsSubtitle ?? '',
      cards: z.array(problemCardSchema).parse(parseRepeater(node.problemsCards)),
    },
    reels: {
      eyebrow: node.reelsEyebrow ?? '',
      title: node.reelsTitle ?? '',
      subtitle: node.reelsSubtitle ?? '',
      selected: z.array(reelSelectedSchema).parse(parseRepeater(node.reelsSelected)),
      ctaText: node.reelsCtaText ?? '',
      ctaButton: node.reelsCtaButton ?? '',
      whatsappMessage: node.reelsWhatsappMessage ?? '',
    },
    process: {
      eyebrow: node.processEyebrow ?? '',
      titlePrefixM: node.processTitlePrefixM ?? '',
      titlePrefixF: node.processTitlePrefixF ?? '',
      titleSuffix: node.processTitleSuffix ?? '',
      rotatingWords: z.array(rotatingWordSchema).parse(parseRepeater(node.processRotatingWords)),
      subtitle: node.processSubtitle ?? '',
      ctaLabel: node.processCtaLabel ?? '',
      steps: z.array(processStepSchema).parse(parseRepeater(node.processSteps)),
    },
  };
}
