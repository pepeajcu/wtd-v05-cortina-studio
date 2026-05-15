import { print, type DocumentNode } from 'graphql';
import { wpConfig } from './config';
import type { WpTag } from './tags';

export interface WpFetchOptions {
  tags?: WpTag[];
  revalidate?: number | false;
}

export class WordPressFetchError extends Error {
  constructor(message: string, public readonly status?: number, public readonly body?: string) {
    super(message);
    this.name = 'WordPressFetchError';
  }
}

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? wpConfig.endpoint;

export async function wpFetch<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string | DocumentNode,
  variables?: TVariables,
  options: WpFetchOptions = {},
): Promise<TData> {
  const { tags = [], revalidate } = options;
  const queryString = typeof query === 'string' ? query : print(query);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query: queryString, variables: variables ?? {} }),
    next: {
      tags,
      revalidate: revalidate === false ? undefined : (revalidate ?? wpConfig.revalidateSeconds),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new WordPressFetchError(
      `WordPress GraphQL HTTP ${res.status}`,
      res.status,
      body,
    );
  }

  const json = (await res.json()) as { data?: TData; errors?: Array<{ message: string }> };

  if (json.errors && json.errors.length > 0) {
    throw new WordPressFetchError(
      `WordPress GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  }

  if (!json.data) {
    throw new WordPressFetchError('WordPress GraphQL returned no data');
  }

  return json.data;
}
