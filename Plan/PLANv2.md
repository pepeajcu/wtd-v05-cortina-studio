# PLAN v2 — Fase 1: Base Estándar de Fábrica (Guía paso a paso a prueba de errores)

> **Contexto para el ejecutor (lee esto antes de empezar):**
> - Estás trabajando en un proyecto Next.js 14 (App Router) en `H:\Dev\Proyecto5`.
> - El proyecto usa TypeScript, Tailwind, `next-intl`, y va a conectarse a un WordPress headless con WPGraphQL + JetEngine.
> - **En esta Fase 1 NO tocas ningún componente existente.** Solo creas la infraestructura base.
> - **NO modificas:** carpeta `components/`, carpeta `app/[locale]/`, carpeta `messages/`, `middleware.ts`, `i18n/request.ts`, `tailwind.config.ts`, `app/globals.css`.
> - **SÍ modificas/creas:** archivos nuevos en `lib/wordpress/`, `app/api/revalidate/`, raíz del proyecto (config files), y `package.json`.
> - Si algo sale mal o tienes dudas, **PARA y pregunta**. No improvises ni inventes nombres de archivos/funciones distintos a los que están en este documento.
> - Usa siempre rutas absolutas con barras invertidas en Windows (`H:\Dev\Proyecto5\...`).
> - Después de cada paso hay una **VERIFICACIÓN**. No avances al siguiente paso si la verificación falla.

---

## Resumen de objetivos de esta fase

Al terminar esta fase, el proyecto tendrá:

1. Las dependencias necesarias instaladas para conectarse a WordPress vía GraphQL.
2. Un único archivo de configuración `wp-config.json` en la raíz que define endpoints, CPTs y nombres de campos.
3. Un cliente GraphQL listo para usarse (`lib/wordpress/client.ts`).
4. Un sistema de validación con Zod que falla temprano si la configuración está mal.
5. Un endpoint de revalidación (`/api/revalidate`) para que WordPress avise cuando cambia contenido.
6. Codegen de tipos TypeScript desde el schema GraphQL.
7. Un `.env.example` con las variables que el desarrollador debe llenar.

**Lo que NO se hace en esta fase:**
- Crear queries `.graphql` específicas (eso es Fase 3).
- Crear fetchers como `getHome()`, `getProyectos()` (eso es Fase 3).
- Conectar componentes a WordPress (eso es Fase 4).
- Configurar WordPress (eso es Fase 2, lo hace el usuario manualmente).

---

## PASO 0 — Verificar estado inicial

**Acción:** Verifica que el proyecto esté en el estado esperado antes de empezar.

**Comandos a ejecutar:**

```bash
ls H:/Dev/Proyecto5/package.json
ls H:/Dev/Proyecto5/lib/wordpress
ls H:/Dev/Proyecto5/Plan/PLANv1.md
```

**Verificación:**
- `package.json` existe.
- La carpeta `lib/wordpress` existe pero está vacía.
- `Plan/PLANv1.md` existe (es el plan aprobado).

**Si algo falla:** PARA y avisa al usuario. No continúes.

---

## PASO 1 — Instalar dependencias

**Acción:** Instala los paquetes necesarios. Hay dos grupos: producción y desarrollo.

**Comando único a ejecutar (desde `H:\Dev\Proyecto5`):**

```bash
npm install graphql graphql-request zod
```

Después:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typed-document-node @graphql-codegen/typescript-graphql-request
```

**¿Por qué cada paquete?**
- `graphql` → librería core de GraphQL (peer dependency).
- `graphql-request` → cliente ligero, ideal para RSC de Next 14 (más liviano que Apollo, ya aprobado en PLANv1).
- `zod` → validación de configuración y respuestas de WP en frontera.
- `@graphql-codegen/cli` → herramienta para generar tipos.
- `@graphql-codegen/typescript` → genera tipos del schema.
- `@graphql-codegen/typescript-operations` → genera tipos de las queries.
- `@graphql-codegen/typed-document-node` → documentos tipados.
- `@graphql-codegen/typescript-graphql-request` → genera un SDK tipado para `graphql-request`.

**Verificación:**
- Abre `package.json` y confirma que aparecen las nuevas entradas en `dependencies` y `devDependencies`.
- No debe haber errores de instalación. Si npm advierte sobre peer deps de React, ignóralo (es ruido de Next 14 + React 18).

**Si algo falla:** PARA. Lee el error y pregunta al usuario.

---

## PASO 2 — Crear `wp-config.json` en la raíz

**Acción:** Crea el archivo `H:\Dev\Proyecto5\wp-config.json` con **EXACTAMENTE** este contenido (cópialo literal):

```json
{
  "endpoint": "https://cms.cortinastudio.com.gt/graphql",
  "siteUrl": "https://cortinastudio.com.gt",
  "revalidateSeconds": 3600,
  "locales": { "default": "es", "supported": ["es", "en"] },
  "cpt": {
    "home": {
      "graphqlSingle": "home",
      "graphqlPlural": "homes",
      "slug": "home-singleton"
    },
    "proyecto": {
      "graphqlSingle": "proyecto",
      "graphqlPlural": "proyectos",
      "orderBy": "featured_order",
      "limit": 12
    }
  },
  "options": {
    "general": "general"
  },
  "fields": {
    "home": {
      "hero": {
        "eyebrow": "hero_eyebrow",
        "title": "hero_title",
        "subtitle": "hero_subtitle",
        "image": "hero_image",
        "imageCaption": "hero_image_caption",
        "ctaLabel": "hero_cta_label",
        "ctaMessage": "hero_cta_message"
      },
      "problems": {
        "eyebrow": "problems_eyebrow",
        "title": "problems_title",
        "subtitle": "problems_subtitle",
        "cards": "problems_cards"
      },
      "reels": {
        "eyebrow": "reels_eyebrow",
        "title": "reels_title",
        "subtitle": "reels_subtitle",
        "selected": "reels_selected",
        "ctaText": "reels_cta_text",
        "ctaButton": "reels_cta_button",
        "whatsappMessage": "reels_whatsapp_message"
      },
      "process": {
        "eyebrow": "process_eyebrow",
        "titlePrefixM": "process_title_prefix_m",
        "titlePrefixF": "process_title_prefix_f",
        "titleSuffix": "process_title_suffix",
        "rotatingWords": "process_rotating_words",
        "subtitle": "process_subtitle",
        "ctaLabel": "process_cta_label",
        "steps": "process_steps"
      }
    },
    "proyecto": {
      "video": "video",
      "videoPoster": "video_poster",
      "videoAlt": "video_alt",
      "platform": "platform",
      "originalUrl": "original_url",
      "spaceType": "space_type",
      "clientProblem": "client_problem",
      "solution": "solution",
      "benefit": "benefit",
      "solutionSummary": "solution_summary"
    },
    "general": {
      "whatsappNumber": "whatsapp_number",
      "whatsappDefaultMessage": "whatsapp_default_message",
      "contactPhone": "contact_phone",
      "contactEmail": "contact_email",
      "contactAddress": "contact_address",
      "socialInstagram": "social_instagram",
      "socialTiktok": "social_tiktok",
      "socialFacebook": "social_facebook",
      "brandName": "brand_name",
      "brandLogo": "brand_logo",
      "footerCtaTitle": "footer_cta_title",
      "footerCtaDescription": "footer_cta_description",
      "footerCtaButton": "footer_cta_button",
      "footerCopyright": "footer_copyright",
      "navItems": "nav_items"
    }
  },
  "iconMap": {
    "problems": { "heat": "Thermometer", "privacy": "EyeOff", "noise": "VolumeX", "decor": "Sparkles" },
    "process": { "whatsapp": "WhatsApp", "mappin": "MapPin", "palette": "Palette", "wrench": "Wrench" }
  }
}
```

**REGLAS DE ORO:**
- **NO cambies** el nombre del archivo. Debe ser exactamente `wp-config.json`.
- **NO cambies** los nombres de los campos del JSON (las claves). Solo el usuario podrá cambiar **valores** después.
- **NO inventes** campos extra. Lo que no esté en este JSON, no va.

**Verificación:**
- El archivo existe en `H:\Dev\Proyecto5\wp-config.json`.
- Es JSON válido (puedes correr `node -e "JSON.parse(require('fs').readFileSync('H:/Dev/Proyecto5/wp-config.json','utf8'))"` y no debe imprimir error).

---

## PASO 3 — Crear `.env.example` en la raíz

**Acción:** Crea `H:\Dev\Proyecto5\.env.example` con **EXACTAMENTE** este contenido:

```
# URL del endpoint GraphQL de WordPress (NEXT_PUBLIC_ porque también lo usa el codegen)
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.cortinastudio.com.gt/graphql

# Secreto compartido entre WP y Next para validar el webhook de revalidación
WORDPRESS_REVALIDATION_SECRET=cambia-este-token-largo-y-aleatorio

# URL pública del sitio frontend
NEXT_PUBLIC_SITE_URL=https://cortinastudio.com.gt

# Secreto para preview mode de WordPress (opcional pero recomendado)
WORDPRESS_PREVIEW_SECRET=cambia-este-otro-token
```

**REGLAS:**
- El archivo se llama `.env.example` con punto al inicio.
- **NO crees `.env.local`**. Eso lo hace el usuario con sus claves reales.
- **NO commitees nunca el `.env.local`** (ya está en `.gitignore`).

**Verificación:**
- El archivo `.env.example` existe en raíz.

---

## PASO 4 — Crear `lib/wordpress/config.ts` (cargador + validador)

**Acción:** Crea `H:\Dev\Proyecto5\lib\wordpress\config.ts` con este contenido **EXACTO**:

```ts
import { z } from 'zod';
import wpConfigJson from '@/wp-config.json';

const cptSchema = z.object({
  graphqlSingle: z.string().min(1),
  graphqlPlural: z.string().min(1),
  slug: z.string().min(1).optional(),
  orderBy: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

const wpConfigSchema = z.object({
  endpoint: z.string().url(),
  siteUrl: z.string().url(),
  revalidateSeconds: z.number().int().nonnegative(),
  locales: z.object({
    default: z.string().min(2),
    supported: z.array(z.string().min(2)).min(1),
  }),
  cpt: z.object({
    home: cptSchema,
    proyecto: cptSchema,
  }),
  options: z.object({
    general: z.string().min(1),
  }),
  fields: z.object({
    home: z.record(z.unknown()),
    proyecto: z.record(z.string()),
    general: z.record(z.string()),
  }),
  iconMap: z.object({
    problems: z.record(z.string()),
    process: z.record(z.string()),
  }),
});

export type WpConfig = z.infer<typeof wpConfigSchema>;

function loadConfig(): WpConfig {
  const parsed = wpConfigSchema.safeParse(wpConfigJson);
  if (!parsed.success) {
    console.error('[wp-config] Invalid wp-config.json:', parsed.error.format());
    throw new Error('wp-config.json failed validation. See logs above.');
  }
  return parsed.data;
}

export const wpConfig = loadConfig();
```

**Notas para el ejecutor:**
- El import `@/wp-config.json` requiere que `tsconfig.json` permita importar JSON. Verifica el siguiente paso.

**Verificación:** se hace en el PASO 5 junto con el ajuste de `tsconfig.json`.

---

## PASO 5 — Ajustar `tsconfig.json` para importar JSON

**Acción:** Abre `H:\Dev\Proyecto5\tsconfig.json` y verifica que tenga:

```json
"resolveJsonModule": true,
"esModuleInterop": true
```

dentro de `compilerOptions`.

**Si NO los tiene, agrégalos.** No toques otras propiedades.

**REGLA:** No reescribas el `tsconfig.json` entero. Solo añade lo que falte. Si ya están ambos, no toques nada.

**Verificación:**
- Ejecuta `npx tsc --noEmit` desde `H:\Dev\Proyecto5`. No debe haber errores nuevos relacionados a `wp-config.json` ni a `lib/wordpress/config.ts`.
- Si hay errores no relacionados a estos archivos, IGNÓRALOS (son del estado previo del proyecto).
- Si hay errores que mencionan `config.ts` o `wp-config.json`, PARA y pregunta.

---

## PASO 6 — Crear `lib/wordpress/tags.ts` (constantes de tags de revalidación)

**Acción:** Crea `H:\Dev\Proyecto5\lib\wordpress\tags.ts`:

```ts
export const WP_TAGS = {
  home: 'wp:home',
  proyectos: 'wp:proyectos',
  general: 'wp:general',
} as const;

export type WpTag = (typeof WP_TAGS)[keyof typeof WP_TAGS];

export const ALL_WP_TAGS: readonly WpTag[] = Object.values(WP_TAGS);
```

**Por qué:** centraliza los nombres de los tags de Next cache para revalidar. Cualquier query que añadas después usa una de estas constantes, nunca strings sueltos.

**Verificación:** el archivo existe y compila (`npx tsc --noEmit`).

---

## PASO 7 — Crear `lib/wordpress/client.ts` (cliente GraphQL)

**Acción:** Crea `H:\Dev\Proyecto5\lib\wordpress\client.ts`:

```ts
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
  query: string,
  variables?: TVariables,
  options: WpFetchOptions = {},
): Promise<TData> {
  const { tags = [], revalidate } = options;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
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
```

**Notas importantes:**
- Usa `fetch` nativo de Next (NO `graphql-request` directo, así nos integramos con el caché de Next por tags).
- `graphql-request` ya está instalado y se usará después en codegen / SDK opcional, pero el cliente principal usa `fetch`.
- `NEXT_PUBLIC_WORDPRESS_API_URL` tiene prioridad sobre `wp-config.json` para que cada entorno (dev/staging/prod) pueda apuntar a un CMS distinto sin tocar el JSON.

**Verificación:** compila sin errores (`npx tsc --noEmit`).

---

## PASO 8 — Crear `lib/wordpress/index.ts` (barrel export)

**Acción:** Crea `H:\Dev\Proyecto5\lib\wordpress\index.ts`:

```ts
export { wpConfig } from './config';
export type { WpConfig } from './config';
export { wpFetch, WordPressFetchError } from './client';
export type { WpFetchOptions } from './client';
export { WP_TAGS, ALL_WP_TAGS } from './tags';
export type { WpTag } from './tags';
```

**Por qué:** un solo punto de import (`import { wpFetch, WP_TAGS } from '@/lib/wordpress'`).

**Verificación:** compila sin errores.

---

## PASO 9 — Crear el endpoint de revalidación

**Acción:** Crea la carpeta y archivo `H:\Dev\Proyecto5\app\api\revalidate\route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ALL_WP_TAGS, WP_TAGS, type WpTag } from '@/lib/wordpress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RevalidatePayload {
  tag?: string;
  tags?: string[];
}

function isValidTag(value: string): value is WpTag {
  return (ALL_WP_TAGS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.WORDPRESS_REVALIDATION_SECRET;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: missing WORDPRESS_REVALIDATION_SECRET' },
      { status: 500 },
    );
  }

  if (secret !== expected) {
    return NextResponse.json({ ok: false, error: 'Invalid secret' }, { status: 401 });
  }

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const requestedTags: string[] = payload.tags ?? (payload.tag ? [payload.tag] : []);

  if (requestedTags.length === 0) {
    for (const tag of ALL_WP_TAGS) revalidateTag(tag);
    return NextResponse.json({ ok: true, revalidated: ALL_WP_TAGS, mode: 'all' });
  }

  const validTags = requestedTags.filter(isValidTag);
  const unknown = requestedTags.filter((t) => !isValidTag(t));

  for (const tag of validTags) revalidateTag(tag);

  return NextResponse.json({
    ok: true,
    revalidated: validTags,
    ignored: unknown,
    available: Object.values(WP_TAGS),
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'POST with ?secret=... and { tag } or { tags: [] } body' },
    { status: 200 },
  );
}
```

**Reglas:**
- **NO uses `revalidatePath`** aunque AGENTS.md lo mencione. Usamos tags (decisión confirmada en PLANv1).
- El `GET` es solo un healthcheck para que el dev pueda verificar que la ruta existe.

**Verificación:**
- El archivo existe.
- Si tienes el dev server corriendo, GET a `http://localhost:3000/api/revalidate` debe devolver el JSON con `ok: true`.

---

## PASO 10 — Crear configuración de codegen

**Acción 10.1:** Crea `H:\Dev\Proyecto5\codegen.ts`:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!endpoint) {
  throw new Error(
    'NEXT_PUBLIC_WORDPRESS_API_URL is not set. Create .env.local from .env.example before running codegen.',
  );
}

const config: CodegenConfig = {
  schema: endpoint,
  documents: ['lib/graphql/queries/**/*.graphql'],
  generates: {
    'lib/graphql/generated/types.ts': {
      plugins: ['typescript'],
    },
    'lib/graphql/generated/operations.ts': {
      preset: 'import-types',
      presetConfig: {
        typesPath: './types',
      },
      plugins: ['typescript-operations', 'typed-document-node'],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
```

**Acción 10.2:** Edita `H:\Dev\Proyecto5\package.json` y añade dentro de `"scripts"` estas dos líneas (manteniendo las que ya existen):

```json
"codegen": "graphql-codegen --config codegen.ts",
"codegen:watch": "graphql-codegen --config codegen.ts --watch"
```

**Cómo editar `package.json` correctamente:**
- Lee el archivo completo primero.
- Usa la herramienta `Edit` con `old_string` y `new_string` que incluyan suficiente contexto para que sea único.
- **NO sobrescribas** todo el `package.json` con `Write`. Solo añade los scripts dentro de `"scripts"`.
- La sección `"scripts"` resultante debe verse así (en orden):
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
  ```

**Acción 10.3:** Crea un archivo `.gitkeep` (vacío) en `H:\Dev\Proyecto5\lib\graphql\generated\.gitkeep` para mantener la carpeta presente. Y otro en `H:\Dev\Proyecto5\lib\graphql\queries\.gitkeep`.

**Verificación:**
- Los scripts aparecen en `package.json`.
- `codegen.ts` existe.
- Las dos carpetas `lib/graphql/generated` y `lib/graphql/queries` existen y tienen `.gitkeep`.
- **NO ejecutes `npm run codegen` todavía.** Eso es Fase 3 (cuando haya queries y un endpoint real). Si lo corres ahora, va a fallar porque no hay queries y porque el endpoint del `.env.example` es un placeholder. Está bien que sea así.

---

## PASO 11 — Crear `lib/wordpress/README.md` (playbook breve)

**Acción:** Crea `H:\Dev\Proyecto5\lib\wordpress\README.md`:

````md
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

```
npm run codegen
```

Genera:
- `lib/graphql/generated/types.ts` — tipos del schema.
- `lib/graphql/generated/operations.ts` — documentos tipados de tus queries.
````

**Verificación:** archivo existe.

---

## PASO 12 — Validación final integral

**Acción:** Corre estas verificaciones en orden y reporta el resultado de cada una al usuario.

1. **Type check:**
   ```bash
   npx tsc --noEmit
   ```
   Resultado esperado: 0 errores nuevos. Si hay errores que ya existían antes de esta fase, repórtalos pero no los arregles.

2. **Lint:**
   ```bash
   npm run lint
   ```
   Resultado esperado: sin errores nuevos en archivos creados en esta fase.

3. **Build:**
   ```bash
   npm run build
   ```
   Resultado esperado: build exitoso. **Nota:** puede fallar si `NEXT_PUBLIC_WORDPRESS_API_URL` no está disponible en build time. Si falla por eso, está bien — se documenta y se resuelve cuando el usuario configure `.env.local`. Repórtalo pero no lo arregles inventando valores.

4. **Estructura de archivos esperada al final de esta fase:**

   ```
   H:\Dev\Proyecto5\
   ├── wp-config.json                          ← NUEVO
   ├── .env.example                            ← NUEVO
   ├── codegen.ts                              ← NUEVO
   ├── package.json                            ← MODIFICADO (scripts codegen)
   ├── tsconfig.json                           ← MODIFICADO si faltaba resolveJsonModule
   ├── app/
   │   └── api/
   │       └── revalidate/
   │           └── route.ts                    ← NUEVO
   └── lib/
       ├── graphql/
       │   ├── generated/.gitkeep              ← NUEVO
       │   └── queries/.gitkeep                ← NUEVO
       └── wordpress/
           ├── README.md                       ← NUEVO
           ├── client.ts                       ← NUEVO
           ├── config.ts                       ← NUEVO
           ├── index.ts                        ← NUEVO
           └── tags.ts                         ← NUEVO
   ```

5. **Lo que NO debe haber cambiado:**
   - `app/[locale]/page.tsx`
   - `app/[locale]/layout.tsx`
   - `app/globals.css`
   - Nada en `components/`
   - Nada en `messages/`
   - `middleware.ts`
   - `i18n/request.ts`
   - `tailwind.config.ts`

   Si algo de esa lista cambió, **REVIERTE el cambio**. Esta fase NO toca esos archivos.

---

## PASO 13 — Reporte final al usuario

**Acción:** Cuando terminen los pasos 0–12, escribe al usuario un resumen con:

1. Lista de archivos creados (con ruta absoluta).
2. Lista de archivos modificados (con explicación de qué cambió en cada uno).
3. Resultado de `tsc --noEmit`, `lint` y `build` (OK / falló por X).
4. Próximos pasos para el usuario:
   - Crear `.env.local` copiando `.env.example` y poniendo URL real del CMS y secret.
   - Pasar a Fase 2 (configuración de WordPress: plugins, CPTs, JetEngine).
5. Confirmación explícita: **"Fase 1 (Base de fábrica) completada. NO se modificaron componentes ni queries específicas. Listo para Fase 2."**

---

## Errores comunes a evitar

- **NO** instales `@apollo/client`. Está prohibido en este proyecto (decisión de PLANv1).
- **NO** crees archivos `getHome.ts`, `getProyectos.ts`, queries `.graphql` ni mappers en esta fase. Eso es Fase 3.
- **NO** modifiques los componentes existentes para "adelantar trabajo". Esta fase es solo infraestructura.
- **NO** crees un `.env.local`. Ese archivo lo crea el usuario con sus credenciales.
- **NO** inventes nuevos campos en `wp-config.json` aunque "tengan sentido". Si crees que falta algo, PARA y pregunta.
- **NO** uses `revalidatePath`. Solo `revalidateTag`.
- **NO** cambies los nombres de los tags (`wp:home`, `wp:proyectos`, `wp:general`).
- **NO** uses `cd` en comandos. Usa rutas absolutas o ejecuta desde la raíz del proyecto que ya está como working dir.
- **NO** ejecutes `npm run codegen` en esta fase.
- **NO** ejecutes `git commit` en ningún momento. El usuario decide cuándo commitear.

---

## Si te atascas

Reglas de oro cuando algo no funciona:

1. **Lee el error completo** antes de actuar.
2. **No improvises soluciones destructivas** (no borres archivos, no hagas `npm install` con flags que no estén en este plan, no ejecutes `--force`).
3. **Reporta al usuario** con: qué paso fallaba, comando exacto, error textual, y qué crees que pasa.
4. **Espera instrucciones.** Mejor pausar 30 segundos que romper el proyecto.

---

**Fin del plan. Ejecuta paso por paso, verifica después de cada uno, y reporta al final.**
