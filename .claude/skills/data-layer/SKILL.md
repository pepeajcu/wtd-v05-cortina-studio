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
- Repeaters de JetEngine llegan como **JSON string** (decision del plugin) — el fetcher es responsable de hacer `JSON.parse()` y validar con Zod antes de devolver al RSC.

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
  },
  "iconMap": { "<grupo>": { "<key>": "<LucideIconName>" } }
}
```

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
# lib/graphql/queries/getHome.graphql (ejemplo de plantilla)
query GetHome {
  homeSingletons(first: 1) {
    nodes {
      id
      heroEyebrow
      heroTitle
      heroSubtitle
      heroImage
      problemsCards    # repeater → JSON string, parsear en el fetcher
      processSteps     # repeater → JSON string
    }
  }
}
```

**Reglas:**
- Un archivo `.graphql` por dominio (Home, Proyectos, General). No mezclar dominios.
- Fragments nombrados por destino: `HomeHeroFragment`, `ProyectoCardFragment`.
- Repeaters se nombran exactamente como en `bridge-fields.json` (camelCase) y se documentan como "JSON string" en el comentario.
- Para multi-idioma con WPML/Polylang: pasar `$language: LanguageCodeEnum!` cuando el plugin de i18n este activo. Si el cliente no usa multi-idioma en WP, el i18n vive solo en `messages/{locale}.json` (ver `i18n-fabrica`).
- Naming de query y tipo: derivado del slug del CPT por el plugin. Verificar en GraphiQL antes de escribir (ver `wordpress-bridge`).

---

## 5. Funcion de Fetch Tipada

```ts
// lib/wordpress/getHome.ts (plantilla)
import { z } from 'zod';
import { wpFetch, WP_TAGS } from '@/lib/wordpress';
import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated';

const problemCardSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  iconKey: z.string(),
});
const problemCardsSchema = z.array(problemCardSchema);

export interface HomeData {
  hero: { eyebrow: string; title: string; subtitle: string; image: string | null };
  problems: { cards: z.infer<typeof problemCardSchema>[] };
}

export async function getHome(): Promise<HomeData> {
  const data = await wpFetch<GetHomeQuery>(GetHomeDocument.toString(), undefined, {
    tags: [WP_TAGS.home],
  });

  const node = data.homeSingletons?.nodes?.[0];
  if (!node) throw new Error('Home singleton no encontrado en WP');

  return {
    hero: {
      eyebrow:  node.heroEyebrow  ?? '',
      title:    node.heroTitle    ?? '',
      subtitle: node.heroSubtitle ?? '',
      image:    node.heroImage    ?? null,
    },
    problems: {
      cards: problemCardsSchema.parse(JSON.parse(node.problemsCards ?? '[]')),
    },
  };
}
```

**Reglas del fetcher:**
- Siempre `wpFetch` + tag de `WP_TAGS`. Nunca `fetch` directo.
- Siempre Zod en frontera para repeaters (vienen como JSON string sin tipos).
- Devuelve el shape exacto que consume el componente; sin `null`s sueltos cuando hay defaults posibles.
- El fetcher debe devolver tipos que coincidan con las props que el componente ya consumia — la migracion estatico→dinamico no debe forzar a cambiar el componente.

---

## 6. Migracion estatico → WordPress (Fase 3 → 4 de cada cliente)

```ts
// ANTES (estatico):
const STEPS: Step[] = [ { number: 1, Icon: WhatsAppIcon, ... } ];

// DESPUES (dinamico):
// 1. CPT y meta fields creados en JetEngine (Fase 2 del cliente).
// 2. bridge-fields.json actualizado (espejo de wp-config.json.fields).
// 3. Query GraphQL en /lib/graphql/queries/getHome.graphql.
// 4. npm run codegen → genera GetHomeDocument tipado.
// 5. Fetcher en /lib/wordpress/getHome.ts (parsea repeaters JSON, valida con Zod).
// 6. Llamar desde el RSC: const home = await getHome(locale);
// 7. Mapear al componente: <ProcessSection steps={home.process.steps} />
```

**Reglas de migracion:**
- Los textos de UI puramente cosmeticos (eyebrow, CTA labels que no edita el cliente) siguen en `next-intl`. Lo editorializable (titulos, subtitulos, copies de seccion) vive en WP via JetEngine.
- Si esta en `wp-config.json.fields`, esta en WP. Si no, vive en `messages/{locale}.json`.

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
