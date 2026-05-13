# Plan de Conexión WordPress ↔ Next.js (Estándar para Fábrica)

## Filosofía: "Un solo archivo de configuración"

Toda la conexión vivirá en **`wp-config.json`** en la raíz del proyecto. El cliente edita ese archivo con URLs, nombres de CPT, slugs de campos y claves — nada de tocar código TypeScript. El sistema lee ese JSON y sabe qué consultar.

```
wp-config.json   ← único archivo a tocar por proyecto
.env.local       ← solo credenciales (URL del CMS + secret de revalidación)
```

---

## Plan general (5 fases)

### Fase 1 — Base estándar (reutilizable en toda la fábrica)
1. Instalar deps: `graphql-request`, `graphql`, `zod`, `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`.
2. Crear `lib/wordpress/client.ts` → cliente `graphql-request` con tag `next: { revalidate, tags }`.
3. Crear `lib/wordpress/config.ts` → carga y valida `wp-config.json` con Zod.
4. Crear `app/api/revalidate/route.ts` → recibe webhook de WP y revalida por tag.
5. Crear `.env.example` con las 4 vars estándar.
6. Configurar `codegen.ts` apuntando al endpoint del `.env.local`.

### Fase 2 — WordPress backend (template para fábrica)
1. Plugins (lista abajo).
2. Crear los 3 CPT (Home, Proyecto, General) con JetEngine.
3. Crear los Meta Fields en cada CPT.
4. Exponer todo a GraphQL (toggle de JetEngine + filtros si hace falta).
5. Configurar webhook saliente al endpoint `/api/revalidate`.

### Fase 3 — Capa de queries y fetchers tipados
1. Escribir queries `.graphql` por sección (`getHome.graphql`, `getProyectos.graphql`, `getGeneral.graphql`).
2. Correr `npm run codegen` → genera tipos.
3. Crear fetchers en `lib/wordpress/`: `getHome()`, `getProyectos()`, `getGeneral()`.
4. Crear `mappers/` que transforman la respuesta de WP al shape que ya consumen los componentes (así no tocas las secciones existentes).

### Fase 4 — Migración del Home
1. Convertir `app/[locale]/page.tsx` a RSC que llame `getHome()` + `getProyectos()` + `getGeneral()`.
2. Pasar datos por props a las secciones (ya están preparadas para recibir props tipadas).
3. Borrar arrays hardcoded (`REELS`, `PROBLEMS`, `STEPS`).
4. Reemplazar `502XXXXXXXX` por `general.whatsapp.number` desde la query.

### Fase 5 — QA y replicación
1. Validar webhook de revalidación (publicar en WP → ver cambio en frontend en < 5s).
2. Validar fallback si WP está caído (Zod + `notFound()` controlado).
3. Documentar el "playbook de fábrica" en `README.md`: clonar repo → editar `wp-config.json` → poner `.env.local` → `npm run codegen` → deploy.

---

## Plugins de WordPress a instalar

**Obligatorios:**
1. **WPGraphQL** — endpoint `/graphql`.
2. **JetEngine** (Crocoblock) — CPT y Meta Fields.
3. **JetEngine — WPGraphQL Integration** (módulo interno de JetEngine, se activa en JetEngine → WPGraphQL) — expone los meta fields al schema.
4. **WPGraphQL for ACF** — *opcional*, solo si terminas usando ACF en lugar de JetEngine para algún campo complejo.
5. **WPGraphQL SEO** (Yoast/RankMath) — metadata SEO.
6. **WP Webhooks** *(o Bit Integrations / Code Snippets con `save_post` hook)* — dispara POST a `/api/revalidate` al guardar.

**Recomendados:**
7. **WP Rocket** o **LiteSpeed Cache** — caché del lado WP (no afecta GraphQL pero sí admin).
8. **Safe SVG** — para logos en el footer/header.
9. **Smush** o **ShortPixel** — optimización de imágenes en origen.
10. **WPGraphQL Smart Cache** — caché del endpoint GraphQL con purga por tag.
11. **Polylang** + **WPGraphQL for Polylang** — *solo si* el cliente realmente publicará en EN además de ES.

---

## Estructura de CPT propuesta (con mejoras a tu idea)

Tu instinto está bien. Refino tres cosas:

- **`home`** como CPT con un solo post ("singleton") → mejor que un CPT abierto. Configurar en JetEngine `capability_type: post` + `has_archive: false` + crear solo un registro.
- **`proyecto`** como CPT abierto (cada post = un Reel/proyecto) → exactamente como propones.
- **`general`** → mejor como **Options Page de JetEngine** (no como CPT). Es lo correcto técnicamente: datos globales del sitio (WhatsApp, redes, contacto) no deberían ser un "post". JetEngine Options Pages se exponen a GraphQL igual y la UX para el cliente es más limpia ("Ajustes del sitio" en el menú lateral). Si prefieres CPT por familiaridad, también funciona — te lo dejo en ambas variantes abajo.

---

## Especificación detallada de campos

### A) CPT `home` (singleton, slug: `home`)

GraphQL type: `Home` · Show in GraphQL: `true` · Single name: `home` · Plural name: `homes`

| Sección | Campo (slug) | Tipo JetEngine | Specs / validación |
|---|---|---|---|
| Hero | `hero_eyebrow` | Text | máx 40 chars |
| Hero | `hero_title` | Textarea | máx 120 chars, soporta saltos de línea |
| Hero | `hero_subtitle` | Textarea | máx 200 chars |
| Hero | `hero_image` | Media | mín 1200×1500, formato webp/jpg |
| Hero | `hero_image_caption` | Text | máx 80 chars (la frase italic flotante) |
| Hero | `hero_cta_label` | Text | máx 30 chars |
| Hero | `hero_cta_message` | Textarea | mensaje pre-rellenado de WhatsApp |
| Problemas | `problems_eyebrow` | Text | |
| Problemas | `problems_title` | Text | |
| Problemas | `problems_subtitle` | Textarea | |
| Problemas | `problems_cards` | **Repeater** | min 3, max 6 ítems |
| Problemas → repeater | `icon` | Select | opciones: `heat`, `privacy`, `noise`, `decor` (mapeo a Lucide) |
| Problemas → repeater | `title` | Text | máx 60 |
| Problemas → repeater | `description` | Textarea | máx 140 |
| Reels | `reels_eyebrow` | Text | |
| Reels | `reels_title` | Text | |
| Reels | `reels_subtitle` | Textarea | |
| Reels | `reels_selected` | **Relación 1→N** | apunta a CPT `proyecto`, máx 12 |
| Reels | `reels_cta_text` | Textarea | |
| Reels | `reels_cta_button` | Text | |
| Reels | `reels_whatsapp_message` | Textarea | |
| Proceso | `process_eyebrow` | Text | |
| Proceso | `process_title_prefix_m` | Text | "Tu nuevo" |
| Proceso | `process_title_prefix_f` | Text | "Tu nueva" |
| Proceso | `process_title_suffix` | Text | "en 4 pasos" |
| Proceso | `process_rotating_words` | **Repeater** | min 3 |
| Proceso → repeater | `word` | Text | |
| Proceso → repeater | `gender` | Select | `m` / `f` |
| Proceso | `process_subtitle` | Textarea | |
| Proceso | `process_cta_label` | Text | |
| Proceso | `process_steps` | **Repeater** | exactamente 4 |
| Proceso → repeater | `icon` | Select | `whatsapp`, `mappin`, `palette`, `wrench` |
| Proceso → repeater | `title` | Text | |
| Proceso → repeater | `description` | Textarea | |
| SEO | `seo_title` | Text | |
| SEO | `seo_description` | Textarea | máx 160 |
| SEO | `seo_og_image` | Media | 1200×630 |

### B) CPT `proyecto` (slug: `proyecto`, plural: `proyectos`)

GraphQL type: `Proyecto` · `has_archive: true`

| Campo (slug) | Tipo | Specs |
|---|---|---|
| `video` | Media | MP4 vertical 1080×1920, máx 5MB, H.264 |
| `video_poster` | Media | JPG 1080×1920 |
| `video_alt` | Text | descripción accesibilidad |
| `platform` | Select | `instagram` / `tiktok` |
| `original_url` | URL | enlace al post original |
| `space_type` | Text | "Sala Principal", "Dormitorio Master"… |
| `client_problem` | Textarea | |
| `solution` | Textarea | |
| `benefit` | Text | |
| `solution_summary` | Textarea | la frase italic del card |
| `featured_order` | Number | para ordenar en el carrusel (asc) |

### C) Opciones globales `general` (JetEngine Options Page, slug: `general`)

GraphQL field expuesto como `general` en root query.

| Grupo | Campo (slug) | Tipo | Specs |
|---|---|---|---|
| WhatsApp | `whatsapp_number` | Text | formato `502XXXXXXXX` (sin `+` ni espacios) |
| WhatsApp | `whatsapp_default_message` | Textarea | mensaje fallback |
| Contacto | `contact_phone` | Text | formato E.164 |
| Contacto | `contact_email` | Email | |
| Contacto | `contact_address` | Textarea | |
| Contacto | `contact_maps_url` | URL | Google Maps |
| Redes | `social_instagram` | URL | |
| Redes | `social_tiktok` | URL | |
| Redes | `social_facebook` | URL | |
| Marca | `brand_name` | Text | "Cortina Studio" |
| Marca | `brand_logo` | Media | SVG preferido |
| Marca | `brand_logo_dark` | Media | versión sobre fondo claro |
| Footer | `footer_cta_title` | Text | |
| Footer | `footer_cta_description` | Textarea | |
| Footer | `footer_cta_button` | Text | |
| Footer | `footer_copyright` | Text | |
| Legal | `legal_privacy_url` | URL | |
| Legal | `legal_terms_url` | URL | |
| Legal | `legal_cookies_url` | URL | |
| Navegación | `nav_items` | Repeater | label + url + order |

---

## El "documento único" — `wp-config.json`

Esta es la pieza clave de la fábrica. Para cada nuevo proyecto, el desarrollador solo edita esto:

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

Y el `.env.local` (solo secretos):

```
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.cortinastudio.com.gt/graphql
WORDPRESS_REVALIDATION_SECRET=<token-largo-aleatorio>
NEXT_PUBLIC_SITE_URL=https://cortinastudio.com.gt
WORDPRESS_PREVIEW_SECRET=<otro-token>
```

---

## Flujo de un proyecto nuevo en la fábrica

1. `git clone factory-template nuevo-proyecto`
2. Instalar WordPress + plugins (lista de arriba) — idealmente desde un **template de WP exportado de JetEngine** que ya traiga los CPT y campos creados.
3. Crear `.env.local` con las URLs del nuevo CMS.
4. Editar `wp-config.json` con los slugs reales (si difieren) y mapeos de iconos.
5. `npm install && npm run codegen && npm run dev`.
6. Diseñar las secciones específicas del cliente; los fetchers y mappers genéricos ya funcionan.

---

## Recomendaciones extra (de experto)

1. **No uses Apollo** aunque AGENTS.md lo mencione. Para RSC en Next 14, `graphql-request` es 10× más liviano y se integra nativamente con `fetch` cache de Next (`next: { tags, revalidate }`). Apollo sobra para este caso.
2. **Revalidación por tags, no por path.** Cada query usa un tag (`home`, `proyectos`, `general`). El webhook de WP envía `{ tag: "home" }` y revalidas selectivamente. Más rápido y robusto.
3. **JetEngine Options Page > CPT "general"**. Mejor UX para el cliente y semánticamente correcto.
4. **Exporta el setup de JetEngine como JSON** (JetEngine → Tools → Export). Ese archivo se vuelve parte de tu plantilla de fábrica: lo importas en cada nuevo WP y tienes los CPT + campos en 30 segundos.
5. **Validación con Zod en frontera.** Cada fetcher valida la respuesta de WP con un schema Zod antes de devolverla. Si el cliente borra un campo obligatorio, falla controladamente con mensaje claro en logs en lugar de un crash en runtime.
6. **El icono no es texto libre.** Por eso el campo es `Select` con valores fijos y el `iconMap` del `wp-config.json` traduce a componente Lucide. Esto evita que el cliente escriba "termómetro" y se rompa todo.
7. **Locales en JetEngine**: si vas a publicar en EN, los repeaters se vuelven complejos con Polylang. Recomiendo **arrancar solo en español** y dejar EN para v2 si el cliente realmente lo necesita.

---

## Próximo paso

Cuando confirmes este plan y la estructura de campos, propongo este orden de implementación:

1. Instalar deps + crear `wp-config.json` + `lib/wordpress/config.ts` con validación Zod.
2. Crear `lib/wordpress/client.ts` y `app/api/revalidate/route.ts`.
3. Setup de codegen.
4. Tú creas los CPT en WP con JetEngine (te paso instrucciones paso a paso si quieres, o el JSON de export listo para importar).
5. Escribir queries + mappers + fetchers para Home.
6. Conectar `app/[locale]/page.tsx` al fetcher.

¿Apruebas la estructura de CPT/campos y el `wp-config.json` como está? ¿O quieres ajustar algo (más/menos campos, diferente nombre de slugs, conservar `general` como CPT en lugar de Options Page)?
