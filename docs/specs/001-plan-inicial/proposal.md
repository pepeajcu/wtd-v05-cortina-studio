# 001 — Plan Inicial: Conexion WordPress ↔ Next.js

> Spec Driven Development (SDD). Esta es la **especificacion** del plan inicial: el *que* y el *por que*. El *como* paso a paso vive en `task.md`.

---

## 1. Problema

Hoy el sitio de Cortina Studio funciona con **datos hardcodeados** en el codigo TypeScript (`REELS`, `PROBLEMS`, `STEPS`, numero de WhatsApp literales). Esto:

1. **Impide que el cliente edite su propio contenido** sin pasar por un desarrollador y un deploy.
2. **Acopla contenido y codigo.** Un cambio de copy, un nuevo proyecto en el carrusel, o un numero de WhatsApp actualizado requieren tocar archivos TypeScript.
3. **No tiene CMS.** Las secciones del Home, los proyectos del carrusel y los datos globales (contacto, redes, marca) no tienen fuente de verdad externa.
4. **No es replicable.** Cada cliente nuevo de la fabrica implicaria reescribir el mismo pegamento de datos, sin un contrato estandar.

## 2. Objetivo

Conectar el frontend Next.js a un **WordPress headless** via WPGraphQL + JetEngine, usando un unico archivo de configuracion (`wp-config.json`) que el desarrollador edita por proyecto sin tocar TypeScript. El cliente edita su contenido en el panel de WordPress; el sitio se actualiza automaticamente via revalidacion por tags.

## 3. Principios de diseno

1. **Un solo archivo de configuracion.** `wp-config.json` en la raiz define endpoint, nombres de CPT, slugs de campos e iconMap. Para un nuevo cliente: editar ese archivo + `.env.local`. Nada mas.
2. **`graphql-request` + `fetch` nativo de Next, NO Apollo.** Mas liviano, se integra nativamente con el cache de Next (`next: { tags, revalidate }`).
3. **Revalidacion por tags, no por path.** Cada query lleva un tag (`wp:home`, `wp:proyectos`, `wp:general`). El webhook de WP llama a `/api/revalidate` con el tag afectado; Next invalida solo lo necesario.
4. **Validacion con Zod en frontera.** Cada fetcher valida la respuesta de WP antes de devolverla. Si el cliente borra un campo obligatorio, el error es controlado y explicito, no un crash en runtime.
5. **JetEngine Options Page para datos globales.** Los datos de contacto, redes, marca y footer no son "posts"; son ajustes del sitio. La Options Page de JetEngine es la herramienta semanticamente correcta y da mejor UX al cliente.
6. **CPT `home` como singleton.** Un solo post del tipo `home` actua como la "pagina de inicio editable". No es un CPT abierto.
7. **Separacion estricta motor vs cliente.** `lib/wordpress/` es motor de fabrica — identico en todos los proyectos. Los campos, slugs y valores son del cliente, y viven en `wp-config.json` y `bridge-fields.json`.

## 4. Arquitectura propuesta

### 4.1 Capa de configuracion (por cliente)

```
wp-config.json          # endpoint, CPTs, slugs de campos, iconMap
.env.local              # NEXT_PUBLIC_WORDPRESS_API_URL, WORDPRESS_REVALIDATION_SECRET
```

### 4.2 Capa de infraestructura (motor de fabrica — Fase 1)

```
lib/wordpress/
├── config.ts           # Carga y valida wp-config.json con Zod
├── client.ts           # wpFetch() — fetch nativo + tags + revalidate
├── tags.ts             # Constantes WP_TAGS y ALL_WP_TAGS
└── index.ts            # Barrel export

app/api/revalidate/
└── route.ts            # Endpoint que recibe webhooks de WP y llama revalidateTag()

lib/graphql/
├── queries/            # Archivos .graphql por seccion (Fase 3)
└── generated/          # Tipos generados por codegen (Fase 3)

codegen.ts              # Configuracion de graphql-codegen
```

### 4.3 Estructura de CPT en WordPress (Fase 2)

| CPT / Entidad | Tipo JetEngine | Proposito |
|---|---|---|
| `home` | CPT singleton | Campos editables del Home (hero, problemas, reels, proceso) |
| `proyecto` | CPT abierto | Cada post = un reel/proyecto del carrusel |
| `general` | Options Page | Datos globales: contacto, redes, marca, footer, nav |

### 4.4 Especificacion de campos

**CPT `home` (slug: `home-singleton`)**

| Seccion | Campo | Tipo |
|---|---|---|
| Hero | `hero_eyebrow`, `hero_title`, `hero_subtitle` | Text / Textarea |
| Hero | `hero_image`, `hero_image_caption` | Media / Text |
| Hero | `hero_cta_label`, `hero_cta_message` | Text / Textarea |
| Problemas | `problems_eyebrow`, `problems_title`, `problems_subtitle` | Text / Textarea |
| Problemas | `problems_cards` | Repeater (`key`, `icon`, `title`, `description`) — `key` es slug unico por card; `wp-config.json.iconMap.problems_cards` lo mapea a un componente Lucide. Decision 2026-05-15. |
| Reels | `reels_eyebrow`, `reels_title`, `reels_subtitle` | Text / Textarea |
| Reels | `reels_selected` | Relacion 1→N a CPT `proyecto` |
| Reels | `reels_cta_text`, `reels_cta_button`, `reels_whatsapp_message` | Textarea / Text |
| Proceso | `process_eyebrow`, `process_subtitle`, `process_cta_label` | Text / Textarea |
| Proceso | `process_rotating_words` | Repeater (`word`, `gender`) |
| Proceso | `process_steps` | Repeater (`number`, `icon`, `title`, `description`) — `number` 1..4, define el orden visual del paso. Decision 2026-05-15. |
| SEO | `seo_title`, `seo_description`, `seo_og_image` | Text / Textarea / Media |

**CPT `proyecto`**

`video`, `video_poster`, `video_alt`, `platform`, `original_url`, `space_type`, `client_problem`, `solution`, `benefit`, `solution_summary`, `featured_order`

**Options Page `general`**

WhatsApp (`whatsapp_number`, `whatsapp_default_message`), Contacto (`contact_phone`, `contact_email`, `contact_address`, `contact_maps_url`), Redes (`social_instagram`, `social_tiktok`, `social_facebook`), Marca (`brand_name`, `brand_logo`, `brand_logo_dark`), Footer (`footer_cta_title`, `footer_cta_description`, `footer_cta_button`, `footer_copyright`), Legal (`legal_privacy_url`, `legal_terms_url`, `legal_cookies_url`), Nav (`nav_items`)

### 4.5 Capa de queries y fetchers (Fase 3)

```
lib/graphql/queries/
├── getHome.graphql
├── getProyectos.graphql
└── getGeneral.graphql

lib/wordpress/
├── getHome.ts          # Llama wpFetch + valida con Zod
├── getProyectos.ts
└── getGeneral.ts
```

Los **mappers** transforman la respuesta de WP al shape que ya consumen los componentes existentes, sin tocar los componentes.

### 4.6 Migracion del Home (Fase 4)

`app/[locale]/page.tsx` pasa de RSC con datos hardcodeados a RSC que llama `getHome()` + `getProyectos()` + `getGeneral()` y pasa los datos por props a las secciones. Los arrays `REELS`, `PROBLEMS`, `STEPS` se eliminan.

## 5. Plugins de WordPress requeridos

**Obligatorios:**
1. **WPGraphQL** — endpoint `/graphql`.
2. **JetEngine** (Crocoblock) — CPT y Meta Fields.
3. **JetEngine — WPGraphQL Integration** — expone meta fields al schema GraphQL.
4. **WP Webhooks** (o Code Snippets con hook `save_post`) — dispara POST a `/api/revalidate` al guardar.

**Recomendados:**
5. **WPGraphQL SEO** (Yoast/RankMath) — metadata SEO en GraphQL.
6. **WPGraphQL Smart Cache** — cache del endpoint GraphQL con purga por tag.
7. **Safe SVG** — logos SVG en header/footer.
8. **Smush** o **ShortPixel** — optimizacion de imagenes en origen.
9. **Polylang** + **WPGraphQL for Polylang** — solo si el cliente requiere EN ademas de ES.

## 6. Flujo de replicacion a cliente nuevo

1. `git clone factory-template nuevo-proyecto`
2. Instalar WordPress + plugins (idealmente desde template JetEngine exportado con CPT y campos ya creados).
3. Crear `.env.local` con URL del CMS y secret de revalidacion.
4. Editar `wp-config.json` con slugs y valores del nuevo cliente.
5. `npm install && npm run codegen && npm run dev`
6. Disenar las secciones del cliente — fetchers y mappers genericos ya funcionan.

## 7. Beneficios esperados

- **Cliente autonomo.** Puede editar todo su contenido sin tocar codigo.
- **Revalidacion selectiva.** Cambios en un CPT invalidan solo su tag; el resto del cache se conserva.
- **Cero lock-in.** Si el cliente cambia de CMS, se reemplaza solo `lib/wordpress/` y las queries — los componentes no cambian.
- **Nuevo cliente en < 1 hora.** Template WP exportado + editar 2 archivos + codegen.
- **Falla explicita.** Zod en frontera garantiza que un campo mal configurado lanza un error claro, no un crash silencioso en produccion.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| WP caido: sitio sin datos | Zod + `notFound()` controlado; cache de Next sirve stale hasta que WP vuelva |
| Cliente borra campo obligatorio | Zod valida en cada request; error en logs con mensaje claro |
| Locales + Polylang + repeaters = complejidad | Arrancar solo en ES; dejar EN para v2 si el cliente lo necesita |
| El icono es texto libre y se rompe | Campo `Select` con valores fijos + `iconMap` en `wp-config.json` → Lucide |
| Codegen falla si no hay `.env.local` | `codegen.ts` lanza error explicito si falta `NEXT_PUBLIC_WORDPRESS_API_URL` |

## 9. Lo que este plan NO toca

- Componentes visuales (`components/sections/*`) — solo reciben nuevas props tipadas.
- Diseno, tokens, animaciones — sin cambios.
- `middleware.ts`, `i18n/request.ts`, `messages/*.json` — sin cambios.
- Plugin PHP `cortinastudio-wpgraphql-bridge` — se configura en Fase 2 via `bridge-fields.json` existente.
- Deploy y hosting — fuera de scope de este plan.
