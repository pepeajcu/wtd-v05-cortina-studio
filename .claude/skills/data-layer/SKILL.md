---
name: data-layer
description: Capa de datos lib/wordpress/ — wpFetch, tags de cache, fetchers tipados con Zod en repeaters, patron de array de configuracion pre-WP, endpoint de revalidacion y migracion estatico→dinamico. Cargar cuando la tarea toque queries, fetchers, validacion de datos del CMS o el endpoint /api/revalidate.
---

# Data Architecture — Patron de Datos

Como fluyen los datos del CMS al RSC. La capa `lib/wordpress/` es **codigo de fabrica**: identica en todos los clientes.

---

## 1. Capa frontend `lib/wordpress/`

| Archivo | Rol |
|---|---|
| `config.ts` | Carga `wp-config.json` y lo valida con Zod. Expone `wpConfig` tipado. Falla temprano si el JSON esta mal |
| `client.ts` | Define `wpFetch<TData, TVariables>(query, variables, { tags, revalidate })` sobre `fetch` nativo de Next 14. Lanza `WordPressFetchError` con detalle |
| `tags.ts` | Constantes de tags de cache: `WP_TAGS.home = 'wp:home'`, `WP_TAGS.proyectos`, `WP_TAGS.general` |
| `index.ts` | Barrel export. Importar siempre `from '@/lib/wordpress'` |
| `README.md` | Playbook breve para el dev nuevo |

**Reglas:**
- En RSC los fetchers se llaman con `await`. Nada de hooks de React en la capa de datos.
- Repeaters de JetEngine llegan como **JSON string** (decision del plugin) — el fetcher es responsable de hacer `JSON.parse()` y validar con Zod antes de devolver al RSC. Detalle de la forma real en §5.1.
- `wpFetch` acepta `string | DocumentNode` y serializa con `print()` de `graphql`. Pasa el `*Document` del codegen **directamente** (es un AST `DocumentNode`, no un string); nunca le hagas `.toString()` — produce `"[object Object]"` y rompe la query.

---

## 2. `wp-config.json` (cambia por cliente)

```json
{
  "endpoint": "https://cms.<dominio>/graphql",
  "siteUrl":  "https://<dominio>",
  "revalidateSeconds": 3600,
  "locales": { "default": "es", "supported": ["es", "en"] },
  "cpt": {
    "<key>": { "graphqlSingle": "...", "graphqlPlural": "...", "slug": "...", "limit": 12 }
  },
  "options": { "general": "general" },
  "fields": {
    "<cpt-key>": { "<seccion>": { "<campo>": "<meta_key>" } }
  }
}
```

**Solo Tier B/C va aqui** (ver `arquitectura-fabrica` seccion 7): assets, datos operativos del cliente, campos editoriales de CPTs dinamicos. El copy estatico (titulos, eyebrows, CTAs, microcopy) vive en `messages/{locale}.json`, no en `wp-config.json.fields`.

`endpoint` se sobreescribe en runtime con `process.env.NEXT_PUBLIC_WORDPRESS_API_URL` cuando exista. Asi mismo codigo apunta a CMS distintos en dev/staging/prod.

### Variables de entorno

`.env.example` (commiteado) define las claves; `.env.local` (NO commiteado) lleva los valores reales.

```
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.<dominio>/graphql
WORDPRESS_REVALIDATION_SECRET=<token-aleatorio-32+chars>
NEXT_PUBLIC_SITE_URL=https://<dominio>
WORDPRESS_PREVIEW_SECRET=<otro-token-aleatorio>
```

Generar secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Patron de Array de Configuracion (pre-WP)

Antes de conectar WordPress, los datos viven en arrays tipados dentro de cada componente de seccion:

```ts
interface Step {
  number: 1 | 2 | 3 | 4;
  Icon: ComponentType<LucideProps>;
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { number: 1, Icon: WhatsAppIcon, titleKey: 'step_1_title', descKey: 'step_1_desc' },
];
```

**Reglas:**
- Toda interfaz se exporta para reutilizacion.
- Los textos siempre son claves de traduccion, nunca strings directos.
- Los icons vienen de `lucide-react` como `ComponentType<LucideProps>`.
- Clases Tailwind en datos (iconBg, iconColor) son aceptables para variaciones por item.
- Usar `as const` o union types para valores finitos (`number: 1 | 2 | 3 | 4`).

---

## 4. GraphQL — Estructura de Queries

```graphql
# lib/graphql/queries/getHome.graphql (ejemplo de plantilla — solo Tier B/C)
query GetHome {
  homeSingletons(first: 1) {
    nodes {
      id
      heroImage             # asset (Tier B)
      heroImageCaption      # texto pegado al asset (Tier B, monolingue)
      reelsSelected         # repeater de IDs de proyectos a destacar (Tier C selector)
    }
  }
}
```

**Reglas:**
- Un archivo `.graphql` por dominio (Home, Proyectos, General). No mezclar dominios.
- Solo se piden campos Tier B/C. El copy estatico no vive en WP.
- Fragments nombrados por destino: `HomeHeroFragment`, `ProyectoCardFragment`.
- Repeaters se nombran exactamente como en `bridge-fields.json` (camelCase) y se documentan como "JSON string" en el comentario.
- Para multi-idioma con WPML/Polylang: pasar `$language: LanguageCodeEnum!` cuando el plugin de i18n este activo. Para Tier A i18n vive en `messages/{locale}.json` (ver `i18n-fabrica`).
- Naming de query y tipo: derivado del slug del CPT por el plugin. Verificar en GraphiQL antes de escribir (ver `wordpress-bridge`).

---

## 5. Funcion de Fetch Tipada

```ts
// lib/wordpress/getHome.ts (plantilla — solo Tier B/C)
import { z } from 'zod';
import { wpFetch, WP_TAGS } from '@/lib/wordpress';
import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated';

const reelSelectedSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  slug: z.string().min(1).optional(),
}).passthrough();

export interface HomeData {
  hero: { image: string | null; imageCaption: string };
  reels: { selected: z.infer<typeof reelSelectedSchema>[] };
}

export async function getHome(): Promise<HomeData> {
  const data = await wpFetch<GetHomeQuery>(GetHomeDocument, undefined, {
    tags: [WP_TAGS.home],
  });

  const node = data.homeSingletons?.nodes?.[0];
  if (!node) throw new Error('Home singleton no encontrado en WP');

  return {
    hero: {
      image:        node.heroImage        ?? null,
      imageCaption: node.heroImageCaption ?? '',
    },
    reels: {
      selected: z.array(reelSelectedSchema).parse(parseRepeater(node.reelsSelected)),
    },
  };
}
```

**Reglas del fetcher:**
- Siempre `wpFetch` + tag de `WP_TAGS`. Nunca `fetch` directo.
- Siempre Zod en frontera para repeaters (vienen como JSON string sin tipos).
- Devuelve **solo Tier B/C tipado**. El copy se consume desde i18n en el componente, no se pasa por el fetcher.
- Devuelve el shape exacto que consume `app/[locale]/page.tsx`; sin `null`s sueltos cuando hay defaults posibles.
- Las constantes estructurales (keys de cards, numeros de pasos, iconos) viven como `const` en el componente — no en el fetcher, no en WP.

### 5.1 Forma de los repeaters y el helper `parseRepeater`

El repeater llega como **JSON string**. Al parsear, JetEngine lo serializa de dos formas segun el contexto:

- **Array plano** `[{...}, {...}]` — comun en repeaters de CPT.
- **Object indexado** `{ "item-0": {...}, "item-1": {...} }` (o claves `"0"`, `"1"`) — comun en repeaters de **Options Page**. Ademas los sub-campos pueden venir **prefijados por el slug del repeater** (un repeater `nav_items` expone `nav_items_label`, `nav_items_order`...) y a veces hay un sub-campo de orden que toca ordenar a mano.

Por eso el helper normaliza ambas formas a array con `Object.values`:

```ts
function parseRepeater(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return Object.values(parsed as Record<string, unknown>);
  return [];
}
```

Luego se valida: `z.array(miSchema).parse(parseRepeater(node.miRepeater))`. Si el shape no calza, el `.parse` falla en frontera con error claro, no un crash silencioso aguas abajo.

> Ejemplo vivo: `getHome.ts` con `reels_selected`. El caso historico de Options Page con claves `item-N` prefijadas (`nav_items_*`) motivo la rama `Object.values`; ese repeater concreto se movio a `messages/` en el refactor de 3 tiers, pero la tolerancia del helper sigue siendo necesaria para cualquier repeater de Options futuro.

### 5.2 Resolucion de assets (campos Media)

El bridge devuelve el **attachment ID crudo** (`databaseId` numerico) para campos Media de JetEngine, no la URL. El frontend resuelve los IDs a URLs con un segundo fetch centralizado en el RSC:

```ts
// lib/wordpress/getMediaUrls.ts — IDs → URL absoluta (Map<number, string>)
// query: mediaItems(first: 100, where: { in: $ids }) { nodes { databaseId mediaItemUrl sourceUrl } }
const url = node.mediaItemUrl ?? node.sourceUrl ?? null;
```

**Regla critica:** WPGraphQL popula `sourceUrl` solo para **imagenes**; para **video** ese campo viene vacio — usar `mediaItemUrl`. La query pide ambos y el fetcher resuelve con `mediaItemUrl ?? sourceUrl`. Patron: juntar todos los IDs en `page.tsx`, una sola llamada a `getMediaUrls`, mapear. Tag de cache: `WP_TAGS.media`.

> Solucion ideal pendiente (motor): un tipo `media` en el plugin que resuelva el ID a URL en el backend y elimine este segundo fetch. Ver `wordpress-bridge`.

---

## 6. Donde vive cada dato (tier-based)

Antes de pedir un campo en GraphQL, decide su tier (ver `arquitectura-fabrica` seccion 7):

| Tier | Dato | Fuente |
|---|---|---|
| **A** | Titulos, eyebrows, subtitulos, CTAs, microcopy, labels, navegacion, mensajes prellenados | `messages/{locale}.json` |
| **B** | Telefono, WhatsApp number, email, direccion, redes sociales, logo, imagenes hero | WP Options Page → `getGeneral()` |
| **C** | Proyectos, blog posts, testimonios, galerias, selector de cuales destacar | WP CPT → `getProyectos()`, `getHome().reels.selected`, etc. |

**Migracion estatico → dinamico (solo para Tier B/C):**

```ts
// ANTES (estatico, durante el desarrollo de un cliente nuevo):
const SELECTED_PROYECTOS_IDS = [12, 17, 23];

// DESPUES (Tier C dinamico):
// 1. CPT en JetEngine + repeater `reels_selected` en home-singleton.
// 2. bridge-fields.json mirror de wp-config.json.fields.
// 3. Query GraphQL adelgazado (solo Tier B/C).
// 4. npm run codegen.
// 5. Fetcher valida con Zod y devuelve solo IDs/datos.
// 6. RSC resuelve IDs a entidades completas y los pasa al componente.
```

**Reglas:**
- Por defecto, **todo el copy nuevo arranca en `messages/{locale}.json`** (Tier A). Solo se escala a WP si un cliente especifico pide editar sin contactar al dev.
- Si esta en `wp-config.json.fields`, esta en WP (Tier B o C). Si no, vive en `messages/{locale}.json` (Tier A).
- Constantes estructurales (PROBLEM_CARDS = [{key, icon}, ...]) viven como `const` en el componente. No suben a WP, no viven en JSON.

---

## 7. Endpoint de revalidacion (`app/api/revalidate/route.ts`)

Estandar de fabrica: usa **`revalidateTag`**, no `revalidatePath`. Esto permite invalidar selectivamente por dominio (home, proyectos, general) sin tirar el cache entero.

```
POST https://<dominio>/api/revalidate?secret=<SECRET>
Body: { "tag": "wp:home" }   o   { "tags": ["wp:home", "wp:proyectos"] }
Body vacio → revalida todos los tags conocidos
```

Tags validos vienen de `lib/wordpress/tags.ts`. Si el body trae un tag desconocido se ignora silenciosamente y se devuelve en `ignored` para diagnostico.

---

## 8. Lo que NO debes hacer

- Hacer fetch fuera de `lib/wordpress/`.
- Pasar repeaters de JetEngine sin parsear/validar al RSC.
- Usar `revalidatePath` en lugar de `revalidateTag`.
- Modificar `lib/wordpress/{config,client,tags,index}.ts` por necesidad de un cliente — son codigo de fabrica.
- Devolver `null` en campos que pueden tener default sensato (`'' as string` mejor que `null`).
- Hardcodear el endpoint del CMS en el codigo — siempre `wp-config.json` + override por env var.
