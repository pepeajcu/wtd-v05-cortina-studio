# Capa WordPress — Playbook de Fábrica

Esta carpeta contiene la conexión genérica a WordPress (WPGraphQL + JetEngine).
Es **idéntica en todos los proyectos de la fábrica**. Solo cambian:

1. `wp-config.json` (raíz) — slugs de CPT y nombres de campos.
2. `.env.local` — URL del CMS y secrets.
3. Las queries en `lib/graphql/queries/` y los fetchers en esta carpeta (Fase 3).

## Archivos

- `config.ts` — carga y valida `wp-config.json` con Zod. Falla temprano si está mal.
- `client.ts` — `wpFetch()`: cliente GraphQL sobre `fetch` nativo de Next 14 con tags + revalidate.
- `tags.ts` — constantes de tags de cache (`wp:home`, `wp:proyectos`, `wp:general`).
- `index.ts` — barrel export. Importa siempre desde `@/lib/wordpress`.

## Uso típico (Fase 3 en adelante)

```ts
import { wpFetch, WP_TAGS } from '@/lib/wordpress';
import { GetHomeDocument } from '@/lib/graphql/generated/operations';

export async function getHome() {
  return wpFetch(GetHomeDocument, undefined, { tags: [WP_TAGS.home] });
}
```

## Revalidación desde WordPress

Configura un webhook en WP que haga POST a:

```
https://<tu-sitio>/api/revalidate?secret=<WORDPRESS_REVALIDATION_SECRET>
Content-Type: application/json

{ "tag": "wp:home" }
```

Tags válidos: ver `tags.ts`. Si no envías `tag`, revalida todos.

## Variables de entorno

Ver `.env.example` en la raíz. Para desarrollo local crea `.env.local` (nunca lo commitees).

## Codegen

Cuando ya tengas queries en `lib/graphql/queries/*.graphql` y un endpoint real:

```bash
npm run codegen
```

Genera:
- `lib/graphql/generated/types.ts` — tipos del schema.
- `lib/graphql/generated/operations.ts` — documentos tipados de tus queries.
