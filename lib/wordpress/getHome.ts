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

const reelSelectedSchema = z
  .object({
    slug: z.string().min(1).optional(),
    id: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export type ReelSelectedData = z.infer<typeof reelSelectedSchema>;

export interface HomeData {
  hero: {
    image: string | null;
    imageCaption: string;
  };
  reels: {
    selected: ReelSelectedData[];
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
      image: node.heroImage ?? null,
      imageCaption: node.heroImageCaption ?? '',
    },
    reels: {
      selected: z.array(reelSelectedSchema).parse(parseRepeater(node.reelsSelected)),
    },
  };
}
