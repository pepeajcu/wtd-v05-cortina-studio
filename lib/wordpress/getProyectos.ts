import { wpFetch } from './client';
import { WP_TAGS } from './tags';
import { GetProyectosDocument, type GetProyectosQuery } from '@/lib/graphql/generated';

export interface ProyectoData {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  video: string;
  videoPoster: string | null;
  videoAlt: string;
  platform: string;
  originalUrl: string;
  spaceType: string;
  clientProblem: string;
  solution: string;
  benefit: string;
  solutionSummary: string;
}

export async function getProyectos(): Promise<ProyectoData[]> {
  const data = await wpFetch<GetProyectosQuery>(GetProyectosDocument, undefined, {
    tags: [WP_TAGS.proyectos],
  });

  const nodes = data.proyectos?.nodes ?? [];

  return nodes.map((n) => ({
    id: n.id,
    databaseId: n.databaseId,
    title: n.title ?? '',
    slug: n.slug ?? '',
    video: n.video ?? '',
    videoPoster: n.videoPoster ?? null,
    videoAlt: n.videoAlt ?? '',
    platform: n.platform ?? '',
    originalUrl: n.originalUrl ?? '',
    spaceType: n.spaceType ?? '',
    clientProblem: n.clientProblem ?? '',
    solution: n.solution ?? '',
    benefit: n.benefit ?? '',
    solutionSummary: n.solutionSummary ?? '',
  }));
}
