# Main v0.0.1 — Fabrica de Sitios Premium

> Base estandar replicable para construir sitios web premium en serie con **Next.js 14 + WordPress Headless**.
> Cortina Studio es el primer cliente de referencia; la arquitectura esta disenada para replicarse a cualquier cliente nuevo cambiando solo 3 archivos de configuracion.

---

## Que es esto

Este repo **no es un sitio web de un cliente**. Es la **base de fabrica**: un stack preconfigurado, opinado y documentado que permite entregar sitios premium rapido y con calidad consistente. Cada cliente hereda el 95% del codigo; el 5% restante son los archivos de identidad visual y datos.

### El primer cliente de referencia: Cortina Studio

Cortina Studio es una empresa guatemalteca especializada en cortinas y tratamientos de ventanas a medida. Su sitio fue el primer proyecto construido sobre esta fabrica y valido toda la arquitectura.

**Datos del cliente:**
- Dominio: `cortinastudio.com.gt`
- CMS: `cms.cortinastudio.com.gt`
- Objetivo principal: conversion directa a WhatsApp Business (+502)
- Paleta: verde bosque `#3F4C42` / crema `#D8CFC4` / dorado `#B89B5E`
- Tipografia: Plus Jakarta Sans (headings/body) + Playfair Display italic (subtitulos decorativos)
- Secciones: Hero, Problems-Solutions, Product Showcase, Reels sociales, Proceso de compra, Footer con CTA

---

## Stack tecnologico

| Capa | Tecnologia |
|------|------------|
| Framework | Next.js 14 App Router + TypeScript estricto |
| Estilos | Tailwind CSS (tokens semanticos desde `client-brief.json`) |
| Animaciones | Framer Motion (easing global `[0.22, 1, 0.36, 1]`) |
| i18n | next-intl (espanol default + ingles) |
| CMS | WordPress Headless + WPGraphQL + JetEngine |
| Bridge | Plugin propio `cortinastudio-wpgraphql-bridge` (en este repo) |
| GraphQL client | `wpFetch` sobre `fetch` nativo de Next 14 (sin Apollo) |
| Codegen | `graphql-codegen` con `typed-document-node` |
| Formularios | React Hook Form + Zod |
| SEO | Rank Math + next-sitemap + Metadata API + JSON-LD |

---

## Como funciona la fabrica

### Lo que cambia por cliente (solo estos archivos)

| Archivo | Que define |
|---------|-----------|
| `client-brief.json` | Paleta, tipografias, audiencia, estructura de paginas |
| `wp-config.json` | Endpoint del CMS, slugs de CPT, nombres de meta fields, iconMap |
| `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` | Meta fields expuestos a GraphQL (espejo de `wp-config.json.fields`) |
| `tailwind.config.ts` | Tokens de color y tipografia derivados del brief |
| `messages/{es,en}.json` | Strings de UI (eyebrows, labels, errores) |
| `app/[locale]/page.tsx` y `components/sections/*` | Composicion concreta del cliente |
| `.env.local` | URL del CMS, secrets de revalidacion |

### Lo que NO cambia (codigo de fabrica)

- `lib/wordpress/` — cliente GraphQL, config loader, tags, barrel
- `app/api/revalidate/route.ts` — endpoint de revalidacion por tags
- `wordpress/plugins/cortinastudio-wpgraphql-bridge/*.php` — plugin PHP
- `components/motion/` — FadeIn, FadeInStagger
- `components/ui/` — primitivas de UI
- `i18n/`, `middleware.ts`, `codegen.ts`
- Reglas de diseno: paddings, easing, anatomia de seccion, jerarquia tipografica

---

## Estado actual del proyecto (v0.0.1)

| Fase | Estado | Descripcion |
|------|--------|-------------|
| **Fase 1 — Base de fabrica** | Completa | `lib/wordpress/`, `wp-config.json`, `/api/revalidate`, codegen, `.env.example` |
| **Fase 2 — Backend WordPress** | Completa | Plugin v3.0.0 instalado, CPTs `proyectos` y `home-singleton` expuestos a WPGraphQL, fields validados en GraphiQL |
| **Fase 3 — Queries y fetchers** | Pendiente | Crear archivos `.graphql` por seccion + `getHome()` / `getProyectos()` en `lib/wordpress/`, correr `npm run codegen` |
| **Fase 4 — Conectar componentes** | Pendiente | Reemplazar arrays estaticos en `components/sections/*` por props de los fetchers |

---

## Estructura de carpetas

```
/
├── app/
│   ├── [locale]/              # next-intl routing (es default, en)
│   │   ├── layout.tsx         # Root layout: providers, Header, Footer
│   │   └── page.tsx           # Home: compone las secciones
│   ├── api/
│   │   └── revalidate/        # Endpoint de revalidacion ISR por tags
│   └── globals.css
├── components/
│   ├── ui/                    # Primitivas reutilizables (shadcn/ui)
│   ├── sections/              # Secciones de pagina: Hero, Problems, Reels, etc.
│   ├── layout/                # Header, Footer
│   └── motion/                # FadeIn, FadeInStagger (Framer Motion)
├── lib/
│   ├── graphql/
│   │   ├── queries/           # Queries .graphql (una por dominio)
│   │   └── generated/         # Tipos + operations generados por codegen
│   ├── wordpress/             # Capa estandar de fabrica — no se modifica por cliente
│   │   ├── config.ts          # Carga y valida wp-config.json con Zod
│   │   ├── client.ts          # wpFetch() con tags + revalidate de Next 14
│   │   ├── tags.ts            # WP_TAGS: 'wp:home', 'wp:proyectos', 'wp:general'
│   │   └── index.ts           # Barrel export
│   ├── validators/            # Schemas Zod para formularios y repeaters de WP
│   └── utils.ts               # cn(), buildWhatsAppUrl(), etc.
├── wordpress/
│   └── plugins/
│       └── cortinastudio-wpgraphql-bridge/
│           ├── *.php                # Plugin PHP — nunca cambia
│           └── bridge-fields.json  # Meta fields a exponer — cambia por cliente
├── messages/
│   ├── es.json                # Strings de UI en espanol
│   └── en.json                # Strings de UI en ingles
├── client-brief.json          # Identidad visual del cliente actual
├── wp-config.json             # Contrato de datos: endpoint, CPTs, fields, iconMap
├── tailwind.config.ts         # Tokens derivados del brief
└── .env.example               # Variables de entorno requeridas
```

---

## Inicio rapido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y completar variables de entorno
cp .env.example .env.local
# Editar .env.local con el endpoint real del CMS

# 3. Verificar tipos
npx tsc --noEmit

# 4. Iniciar servidor de desarrollo
npm run dev
```

> **Importante:** no ejecutar `npm run codegen` hasta tener `.env.local` con un endpoint real y al menos una query en `lib/graphql/queries/`.

### Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificacion de tipos |
| `npm run codegen` | Descarga schema de WP + genera tipos TypeScript |
| `npm run schema:fetch` | Solo actualiza `lib/graphql/schema.json` |
| `npm run codegen:watch` | Observa cambios en `.graphql` (usa schema local) |

---

## Agregar un cliente nuevo

Las Fases 1 y 2 ya estan resueltas en este repo. Para un cliente nuevo:

1. Clonar este repo. Verificar que `lib/wordpress/`, `app/api/revalidate/` y `components/motion/` esten intactos.
2. Reemplazar `client-brief.json` con la identidad del nuevo cliente.
3. Mapear colores y tipografias en `tailwind.config.ts`.
4. Editar `wp-config.json`: endpoint, `siteUrl`, slugs de CPT y meta keys.
5. Crear `.env.local` con `NEXT_PUBLIC_WORDPRESS_API_URL`, `WORDPRESS_REVALIDATION_SECRET` y `NEXT_PUBLIC_SITE_URL`.
6. En WordPress: instalar WPGraphQL, JetEngine, Rank Math, WP Webhooks y el plugin `cortinastudio-wpgraphql-bridge`. Crear CPTs y meta fields. Actualizar `bridge-fields.json`.
7. Validar queries en GraphiQL.
8. Escribir `.graphql` por dominio, correr `npm run codegen`, crear fetchers en `lib/wordpress/`.
9. Conectar fetchers a los RSC y reemplazar datos estaticos.

Ver `AGENTS.md` seccion 21 para el checklist completo.

---

## Arquitectura de datos: plugin propio

El plugin `cortinastudio-wpgraphql-bridge` es la pieza clave que conecta JetEngine con WPGraphQL sin tocar `functions.php`. Se configura via `bridge-fields.json`:

```json
{
  "proyectos": {
    "scalar": ["video", "video_poster", "platform", "space_type", "solution"],
    "repeater": []
  },
  "home-singleton": {
    "scalar": ["hero_eyebrow", "hero_title", "hero_subtitle"],
    "repeater": ["problems_cards", "process_steps", "reels_selected"]
  }
}
```

Los repeaters de JetEngine se devuelven como JSON string y se parsean con Zod en el fetcher antes de llegar al componente.

---

## Documentacion interna

| Archivo | Contenido |
|---------|-----------|
| `AGENTS.md` | Manual completo: stack, patrones de diseno premium, sistema de animacion, capa WordPress, checklist de replicacion |
| `CLAUDE.md` | Indice del proyecto e instrucciones para Claude Code |
| `client-brief.json` | Identidad visual del cliente actual (Cortina Studio) |
| `wp-config.json` | Contrato de datos: endpoint, CPTs, meta fields, iconMap |
| `lib/wordpress/README.md` | Playbook breve de la capa de datos |

---

## Licencia

Uso interno — Cortina Studio / Fabrica de Sitios Premium.
