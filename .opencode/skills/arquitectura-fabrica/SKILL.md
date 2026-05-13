---
name: arquitectura-fabrica
description: Stack tecnologico, estructura de carpetas, estrategia de renderizado, reglas de TypeScript/Tailwind y performance checklist de la fabrica. Cargar cuando la tarea toque arquitectura, organizacion de archivos, decisiones RSC vs client, configuracion del build o performance.
---

# Arquitectura de la Fabrica

Manual del **motor**. Aplica a cualquier cliente. Lo que cambia por cliente vive en archivos de configuracion (ver `replicacion-cliente`), no aqui.

---

## 1. Stack Tecnologico Obligatorio

### Core
- **Next.js 14+** con **App Router** (nunca Pages Router).
- **TypeScript estricto** (`"strict": true`, `"noUncheckedIndexedAccess": true`).
- **React Server Components (RSC)** por defecto; `"use client"` solo cuando sea estrictamente necesario.
- **Node.js 20 LTS** o superior.

### Estilos y UI
- **Tailwind CSS** como unico sistema de estilos (nada de CSS-in-JS, CSS Modules, styled-components).
- **shadcn/ui** como base de componentes (copiados al repo, no como dependencia).
- **Framer Motion** para animaciones (ver `diseno-fabrica` para el sistema completo).
- **lucide-react** para iconografia.

### Datos y Backend
- **WordPress Headless** como CMS.
- **WPGraphQL** como capa de datos (no REST API nativa).
- **JetEngine** para CPTs y meta fields.
- **Plugin propio `cortinastudio-wpgraphql-bridge`** para exponer CPTs y meta de JetEngine a WPGraphQL sin tocar `functions.php` (ver `wordpress-bridge`).
- **`graphql-request` + `fetch` nativo** como cliente GraphQL via `wpFetch()` (ver `data-layer`).
- **`graphql-codegen`** para generar tipos TypeScript y `TypedDocumentNode` desde el schema.
- **Rank Math** (no WPGraphQL SEO — descontinuado) para SEO con integracion GraphQL nativa.
- **WP Webhooks** (Cozmoslabs) para revalidacion saliente al frontend.

### Formularios y Validacion
- **React Hook Form** + **Zod** + `@hookform/resolvers/zod`.

### Internacionalizacion
- **next-intl** (ver `i18n-fabrica`).

### SEO
- **next-sitemap** para sitemap automatico.
- **Metadata API** de Next.js 14 en cada pagina.
- **JSON-LD** structured data para Articles, BreadcrumbList, Organization.
- Imagenes con `next/image` siempre; nunca `<img>` nativo.

---

## 2. Estrategia de Renderizado

**SSG + ISR es la estrategia por defecto.**

- Todas las paginas publicas se generan estaticamente con `generateStaticParams`.
- Se revalidan con **ISR** (`revalidate`) o **On-Demand Revalidation** via webhooks desde WordPress.
- Endpoint de revalidacion: `/api/revalidate` protegido con secret token (ver `data-layer`).
- SSR (`dynamic = 'force-dynamic'`) solo cuando el contenido depende del request (cookies, headers, sesion).
- CSR solo para componentes interactivos que requieren estado del navegador.

**Regla:** si dudas entre SSG+ISR y SSR, elige SSG+ISR.

---

## 3. Estructura de Carpetas

```
/
├── app/
│   ├── [locale]/              # next-intl routing
│   │   ├── (marketing)/       # grupo de rutas
│   │   ├── blog/
│   │   ├── layout.tsx         # Root layout con providers + Header + Footer
│   │   └── page.tsx           # Home — compone secciones
│   ├── api/
│   │   └── revalidate/route.ts
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui primitives + atomicos
│   ├── sections/              # secciones de pagina
│   ├── layout/                # Header, Footer
│   └── motion/                # wrappers de Framer Motion reutilizables
├── lib/
│   ├── graphql/
│   │   ├── queries/           # .graphql, una por seccion/dominio
│   │   └── generated/         # tipos + operations generados
│   ├── wordpress/             # CAPA ESTANDAR — NO cambia entre clientes
│   ├── validators/            # schemas Zod
│   └── utils.ts
├── wordpress/
│   └── plugins/
│       └── cortinastudio-wpgraphql-bridge/   # plugin propio
├── wp-config.json             # CAMBIA por cliente
├── messages/{es,en}.json
├── client-brief.json          # CAMBIA por cliente
├── tailwind.config.ts
└── next.config.mjs
```

**Reglas de ubicacion:**
- **Nada** de logica de fetching dentro de componentes. Toda llamada a WordPress vive en `lib/wordpress/`.
- Componentes en `components/sections/` son **tontos**: reciben props tipadas y renderizan.
- `app/` es responsable de llamar a `lib/wordpress/` y pasar datos.
- Utilidades compartidas siempre en `lib/`, nunca en `components/`.
- `lib/wordpress/{config,client,tags,index}.ts` y el plugin PHP son **codigo de fabrica**: igual en todos los clientes.

---

## 4. Reglas de Codigo

### TypeScript
- `strict: true` sin excepciones. Prohibido `any` (usa `unknown` si no sabes el tipo).
- Prohibido `@ts-ignore`. Usa `@ts-expect-error` con comentario si necesitas silenciar algo.
- Tipos generados por `graphql-codegen` son la fuente de verdad para datos de WordPress.
- Props de componentes siempre con interface nombrada: `interface HeroProps { ... }`.

### Componentes
- **Server Components por defecto.** Solo `"use client"` si usas estado, efectos, handlers del navegador, o Framer Motion interactivo.
- Componentes **modulares y pequenos**: si un componente pasa de ~150 lineas, se divide.
- Props siempre desestructuradas con valores default explicitos.
- Un componente = un archivo. Sin excepciones.
- PascalCase para componentes, camelCase para funciones/variables, kebab-case para archivos no-componente.

### Estilos (Tailwind)
- Colores, tipografia y spacing **deben venir de `client-brief.json`** mapeados en `tailwind.config.ts`. Prohibido hardcodear colores hex en JSX.
- Tokens semanticos: `bg-primary`, `text-foreground`, no `bg-[#1a1a1a]`.
- Usa `cn()` (de `lib/utils.ts`, basado en `clsx` + `tailwind-merge`) para combinar clases condicionalmente.
- Mobile-first siempre. Breakpoints en orden: base → `sm:` → `md:` → `lg:` → `xl:`.

### GraphQL
- Queries en archivos `.graphql` separados bajo `lib/graphql/queries/`. Detalles completos en `data-layer`.

### Formularios
- Todo formulario usa `react-hook-form` + `zodResolver`.
- Schema Zod en `lib/validators/` reutilizado en cliente Y servidor.
- Mensajes de error traducidos via `next-intl`.

---

## 5. Performance Checklist

- LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Imagenes con `next/image` siempre con `sizes` prop optimizado.
- Fuentes con `next/font/google` + `display: 'swap'` + `variable`.
- Videos con `preload="metadata"` + autoplay via IntersectionObserver (no autoplay al cargar).
- Lazy load por defecto; `priority` solo en imagen above-the-fold (Hero, primer slide).
- Componentes client lo mas pequenos posible; RSC para todo lo demas.
- No `console.log` en produccion.
- No dependencias innecesarias; verificar que shadcn/ui o el stack actual no resuelve antes de instalar.

---

## 6. Lo que NO debes hacer (arquitectura)

- Usar Pages Router.
- Usar `any` en TypeScript.
- Hacer fetch dentro de componentes de UI.
- Escribir queries GraphQL inline en componentes.
- Usar `<img>`, `<a>` nativos cuando existen `next/image` y `next/link`.
- Instalar librerias fuera del stack sin justificacion.
- Tocar archivos del motor (`lib/wordpress/`, `app/api/revalidate/`, `components/motion/`, plugin PHP) por necesidades de un cliente — eso es evolucion del motor, no parche del cliente actual.
