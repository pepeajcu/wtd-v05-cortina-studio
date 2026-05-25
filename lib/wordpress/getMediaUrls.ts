import { wpFetch } from './client';
import { WP_TAGS } from './tags';
import {
  GetMediaUrlsDocument,
  type GetMediaUrlsQuery,
  type GetMediaUrlsQueryVariables,
} from '@/lib/graphql/generated';

/**
 * Resuelve attachment IDs (databaseId) a sourceUrl absolutos.
 * Workaround: el bridge actual devuelve el ID crudo para campos Media de JetEngine
 * en vez de la URL del attachment. Hasta que el plugin soporte tipo 'media',
 * el frontend resuelve los IDs con una segunda query a `mediaItems`.
 */
export async function getMediaUrls(ids: number[]): Promise<Map<number, string>> {
  const unique = Array.from(new Set(ids.filter((n) => Number.isFinite(n) && n > 0)));
  if (unique.length === 0) return new Map();

  const variables: GetMediaUrlsQueryVariables = {
    ids: unique.map((n) => String(n)),
  };

  const data = await wpFetch<GetMediaUrlsQuery, GetMediaUrlsQueryVariables>(
    GetMediaUrlsDocument,
    variables,
    { tags: [WP_TAGS.media] },
  );

  const map = new Map<number, string>();
  for (const node of data.mediaItems?.nodes ?? []) {
    // `sourceUrl` solo se popula para imagenes; para videos hay que usar `mediaItemUrl`.
    const url = node?.mediaItemUrl ?? node?.sourceUrl ?? null;
    if (node?.databaseId && url) {
      map.set(node.databaseId, url);
    }
  }
  return map;
}
