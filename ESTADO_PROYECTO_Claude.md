# ESTADO DEL PROYECTO — Análisis Claude vs AGENTS.md
> Generado: 2026-05-11 | Modelo: Claude Sonnet 4.6 | Rama: main

Este documento contrasta lo que AGENTS.md establece como estándar de fábrica contra el estado real del repositorio. Responde tres preguntas: ¿qué se hizo?, ¿qué ya no aplica?, ¿qué falta?. Incluye además un análisis de las Skills instaladas en `.opencode/`.

---

## 1. RESUMEN EJECUTIVO

| Fase | Estado CLAUDE.md | Estado Real |
|------|-----------------|-------------|
| **Fase 1** — Base de fábrica | ✅ Completa | ✅ Completa (con 4 desviaciones documentadas) |
| **Fase 2** — Backend WordPress | ✅ Completa | ✅ Completa (con cambio de enfoque crítico) |
| **Fase 3** — Queries y fetchers | ⏳ Pendiente | 🔶 Parcial (queries + codegen ✓, fetchers ✗) |
| **Fase 4** — Conectar componentes | ⏳ Pendiente | ❌ No iniciada |
| **UI / Componentes** | No mencionada como fase | ✅ Completa (bonus: todo el layout construido) |

---

## 2. FASE 1 — BASE DE FÁBRICA

### ✅ Completado (coincide con AGENTS.md)

| Archivo / Elemento | Descripción |
|---|---|
| `lib/wordpress/client.ts` | `wpFetch()` con `fetch` nativo de Next 14, tags + revalidate |
| `lib/wordpress/config.ts` | Carga y valida `wp-config.json` con Zod |
| `lib/wordpress/tags.ts` | Constantes `WP_TAGS` (`wp:home`, `wp:proyectos`, `wp:general`) |
| `lib/wordpress/index.ts` | Barrel export estándar |
| `lib/wordpress/README.md` | Playbook breve de la capa |
| `app/api/revalidate/route.ts` | Endpoint `POST` con validación de secret, revalidación por tags |
| `wp-config.json` | Contrato de datos completo (endpoint, CPTs, fields, iconMap) |
| `.env.example` | 4 variables estándar documentadas |
| `lib/graphql/queries/` | Carpeta creada con `.gitkeep` |
| `lib/graphql/generated/` | Carpeta creada con `.gitkeep` |
| `tsconfig.json` | `resolveJsonModule: true` y `esModuleInterop: true` confirmados |

### ⚠️ Desviaciones documentadas (mejoras sobre el plan original)

**1. `codegen.ts` — Cambio de fuente de schema**

PLANv2 proponía:
```ts
schema: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,  // endpoint directo
```

Estado real:
```ts
schema: 'lib/graphql/schema.json',  // archivo local
```

**Por qué cambió:** Algunos servidores PHP (staging con Traefik/Docker) devuelven un BOM (`﻿`) al inicio de las respuestas JSON. `@graphql-tools/url-loader` falla al parsear ese JSON. La solución estable fue descargar el schema a un archivo local y que codegen lo lea desde ahí. Se añadió `scripts/fetch-schema.mjs` para este paso.

**2. Un solo archivo generado en vez de dos**

PLANv2 proponía:
```
lib/graphql/generated/types.ts       ← @graphql-codegen/typescript
lib/graphql/generated/operations.ts  ← import-types preset
```

Estado real:
```
lib/graphql/generated/index.ts  ← todo junto (typescript + typescript-operations + typed-document-node)
```

**Por qué cambió:** El preset `import-types` requiere `@graphql-codegen/import-types-preset` que no estaba instalado y generaba error `Unable to find preset`. La solución fue fusionar los tres plugins en un único archivo. Es más limpio y no requiere paquetes extra.

**3. Parseo manual de `.env.local` en `codegen.ts`**

PLANv2 no especificaba cómo cargar las variables en codegen. El archivo real incluye:
```ts
if (fs.existsSync('.env.local')) {
  const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}
```
**Por qué:** `codegen.ts` corre fuera del contexto de Next.js, `process.env` no incluye `.env.local`. Se parsea manualmente para no instalar `dotenv` como dependencia innecesaria.

**4. `scripts/fetch-schema.mjs` — no estaba en PLANv2**

Archivo adicional que hace introspección al endpoint de WordPress y guarda el resultado en `lib/graphql/schema.json`. Resuelve el problema del BOM. Los scripts de `package.json` son:
```
"codegen"         → fetch-schema + genera
"schema:fetch"    → solo actualiza schema.json
"codegen:watch"   → observa cambios usando el schema.json existente
```

### ❌ Lo que AGENTS.md menciona y NO existe

| Elemento | Estado |
|---|---|
| `lib/validators/` | No creada. AGENTS.md la menciona para schemas Zod de formularios y repeaters. |
| `lib/utils.ts` | ✅ Sí existe (cn(), helpers) |

---

## 3. FASE 2 — BACKEND WORDPRESS

### ✅ Completado (con cambio de enfoque crítico)

| Elemento | Estado |
|---|---|
| Plugin `cortinastudio-wpgraphql-bridge` v3.0.0 | Instalado en WP, funcional |
| CPT `proyectos` | Expuesto en WPGraphQL como `Proyecto` / query `proyectos` |
| CPT `home-singleton` | Expuesto en WPGraphQL como `HomeSingleton` / query `homeSingletons` |
| Meta fields scalares y repeaters | Validados en GraphiQL IDE |
| `bridge-fields.json` | Configurado con todos los meta keys (scalares + repeaters) |
| WPGraphQL | Instalado en WordPress |
| JetEngine | CPTs y meta fields creados |
| Rank Math | Instalado (SEO con integración GraphQL nativa) |
| WP Webhooks (Cozmoslabs) | Instalado para revalidación saliente |

### 🔄 Cambio de enfoque crítico — El plugin vs functions.php

**PLANv1 proponía** (en este orden):
1. Activar módulo "JetEngine WPGraphQL Integration" dentro de JetEngine
2. Si no existe, usar `functions.php` con `register_post_type_args` + `graphql_register_types`

**Lo que realmente pasó:** El módulo "JetEngine WPGraphQL Integration" **no existe** en JetEngine 3.8+. Tampoco como add-on descargable. La opción de `functions.php` funcionaría pero rompe la promesa de fábrica (cada cliente = código PHP diferente en el tema).

**La solución adoptada:** Se construyó el plugin `cortinastudio-wpgraphql-bridge` que:
- **Bloque 1 (CPTs):** usa un filtro `register_post_type_args` con lista negra — cualquier CPT no nativo de WP se expone automáticamente a WPGraphQL. Sin tocar `functions.php`.
- **Bloque 2 (Meta fields):** lee `bridge-fields.json` y llama `register_graphql_field` por cada meta key.
- **Panel admin:** `Settings → WPGraphQL Bridge` muestra estado y permite escanear posts.

El plugin pasó por 6 versiones (zips v1→v6 en `wordpress/plugins/`) antes de estabilizarse. Esto es parte del historial de desarrollo, no del estado actual.

### ⚠️ Discrepancias con PLANv1 en plugins

| Plugin PLANv1 | Estado real |
|---|---|
| `JetEngine WPGraphQL Integration` (módulo) | No existe — reemplazado por el plugin propio |
| `WPGraphQL SEO` (Ash Hitchcock) | Descontinuado — reemplazado por **Rank Math** con integración GraphQL nativa |
| `WPGraphQL Smart Cache` | No instalado (caching opcional, no crítico para fábrica) |
| `Polylang + WPGraphQL for Polylang` | No instalado (EN aplazado para v2 si el cliente lo necesita) |

---

## 4. FASE 3 — QUERIES Y FETCHERS

### ✅ Completado parcialmente

| Elemento | Estado |
|---|---|
| `lib/graphql/queries/getHome.graphql` | ✅ Existe — pide todos los campos del `home-singleton` |
| `lib/graphql/queries/getProyectos.graphql` | ✅ Existe — pide todos los campos de `proyectos` |
| `lib/graphql/schema.json` | ✅ Existe — descargado desde el WP real |
| `lib/graphql/generated/index.ts` | ✅ Existe — codegen fue ejecutado correctamente |

### ❌ Pendiente (lo más crítico de Fase 3)

| Elemento | Estado | Descripción |
|---|---|---|
| `lib/wordpress/getHome.ts` | ❌ No creado | Fetcher que llama a `wpFetch` con `GetHomeDocument` + parsea repeaters con Zod |
| `lib/wordpress/getProyectos.ts` | ❌ No creado | Fetcher para proyectos |
| Schemas Zod de repeaters | ❌ No creados | `problemCardsSchema`, `processStepsSchema`, etc. para validar JSON strings |

**Consecuencia directa:** Sin los fetchers, Fase 4 no puede comenzar. `app/[locale]/page.tsx` actualmente llama a los componentes sin pasarles datos de WordPress.

---

## 5. FASE 4 — CONECTAR COMPONENTES

### ❌ No iniciada

`app/[locale]/page.tsx` actual:
```tsx
// Sin await, sin fetchers, sin props de WP
export default async function Home({ params }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <main>
      <Hero />
      <ProblemsSection />
      <ReelsSection />
      <ProcessSection />
    </main>
  );
}
```

Los componentes de sección usan datos estáticos internos (arrays hardcodeados, traducciones via `next-intl`). Hasta que los fetchers existan, no hay datos de WP que pasar como props.

---

## 6. TRABAJO EXTRA — UI COMPLETA CONSTRUIDA

Esto no está en ninguna fase del plan original pero se completó antes de conectar WP:

### Componentes existentes (producción-ready según AGENTS.md patterns)

| Componente | Descripción |
|---|---|
| `components/motion/FadeIn.tsx` | Scroll-triggered fade con EASING global `[0.22, 1, 0.36, 1]` |
| `components/motion/FadeInStagger.tsx` | Grid/cards con stagger configurable |
| `components/motion/ProcessTitle.tsx` | Título con palabras rotantes (AnimatePresence) |
| `components/layout/Header.tsx` | Header fijo, scroll-aware (bg-transparent → bg-background/95 backdrop-blur) |
| `components/layout/Footer.tsx` | Footer con 3 zonas (CTA strip + grid + bottom bar) |
| `components/sections/Hero.tsx` | Hero dividido en 2 columnas, Double-Bezel en imagen |
| `components/sections/ProblemsSection.tsx` | Grid de cards con iconos de lucide |
| `components/sections/ReelsSection.tsx` | Sección de reels (wrapper de carrusel) |
| `components/sections/ReelsCarousel.tsx` | Carrusel con dots de navegación |
| `components/sections/ProcessSection.tsx` | Timeline de pasos con rotating words |
| `components/ui/ReelCard.tsx` | Card de video con overlay slide-up |

Todos siguen los patrones de AGENTS.md: eyebrow + H2 + subtitle + divider, `py-24 lg:py-32`, tokens semánticos, `focus-visible:ring-2`, `aria-labelledby`.

---

## 7. QUÉ YA NO APLICA (obsoleto o superado)

| Item del plan | Por qué no aplica |
|---|---|
| "Activar módulo JetEngine WPGraphQL Integration" | No existe en JetEngine 3.8+. El plugin propio resuelve esto |
| "PHP en functions.php para exponer CPTs" | Reemplazado por el plugin — mejor para la fábrica |
| "Instalar WPGraphQL SEO" | Plugin descontinuado — Rank Math tiene integración nativa |
| `codegen.ts` apuntando al endpoint directo | Reemplazado por schema.json local (BOM workaround) |
| Dos archivos generados (`types.ts` + `operations.ts`) | Un solo `index.ts` — evita el preset `import-types` |
| `Plan/PLANv1.md` y `Plan/PLANv2.md` | Son historial de construcción, no instrucciones activas. CLAUDE.md lo indica explícitamente |

---

## 8. QUÉ FALTA POR HACER

### Prioridad inmediata — Completar Fase 3

```
1. Crear lib/wordpress/getHome.ts
   - import { wpFetch, WP_TAGS } from '@/lib/wordpress'
   - import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated'
   - Schemas Zod para: problemsCards, reelsSelected, processRotatingWords, processSteps
   - JSON.parse + .parse(Zod) en cada repeater
   - Devolver HomeData tipado al RSC

2. Crear lib/wordpress/getProyectos.ts
   - Similar patrón con GetProyectosDocument + WP_TAGS.proyectos
   - Sin repeaters (todos son scalar en bridge-fields.json)

3. (Opcional pero recomendado) Crear lib/validators/
   - Mover los schemas Zod de repeaters aquí para reutilización
```

### Siguiente — Fase 4

```
4. Modificar app/[locale]/page.tsx
   - await getHome(locale)
   - await getProyectos()
   - Pasar datos por props a Hero, ProblemsSection, ReelsSection, ProcessSection

5. Actualizar interfaces de props en cada sección
   - HeroProps con datos de WP (heroTitle, heroImage, etc.)
   - ProblemsSectionProps con ProblemCard[]
   - etc.

6. Eliminar arrays estáticos hardcodeados en los componentes

7. Reemplazar numero WhatsApp hardcodeado por general.whatsappNumber desde WP
```

### Validación final

```
8. npx tsc --noEmit → sin errores
9. npm run lint → sin errores
10. npm run build → exitoso
11. Publicar en WP → POST llega a /api/revalidate → página actualizada sin redeploy
12. Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms
```

---

## 9. SKILLS INSTALADAS EN `.opencode/` — ANÁLISIS DE USO

### Instalación

Las 7 skills están instaladas desde el repositorio `Leonxlnx/taste-skill` (GitHub). Cada skill existe en **dos versiones simultáneas**:
- `.opencode/skills/.agents/skills/` → para agentes (OpenCode, Cursor, etc.)
- `.opencode/skills/.claude/skills/` → para Claude Code (este CLI)

La duplicación es intencional: permite usar las mismas skills en cualquier editor.

### Catálogo de Skills

| Skill | Función | Uso en este proyecto |
|---|---|---|
| `design-taste-frontend` | Senior UI/UX Engineer. Reglas métricas, arquitectura de componentes, aceleración CSS, anti-slop | **ACTIVO** |
| `high-end-visual-design` | Patrones de agencia premium: Double-Bezel, spring physics, asymmetric layouts | **ACTIVO (evidencia directa en código)** |
| `full-output-enforcement` | Previene truncación — código completo o nada | **ACTIVO (guardrail de sesión)** |
| `stitch-design-taste` | Genera DESIGN.md para Google Stitch (sistema de diseño semántico) | **PARCIALMENTE ACTIVO** |
| `redesign-existing-projects` | Audita y mejora diseños existentes sin reescribir desde cero | **POSIBLEMENTE ACTIVO** |
| `minimalist-ui` | Interfaces editoriales limpias, paleta monocromática | **BAJA ACTIVIDAD** |
| `industrial-brutalist-ui` | UI cruda mecánica, tipografía suiza extrema | **NO ACTIVO** |

---

### Evidencia de uso en el código

#### `high-end-visual-design` — Evidencia directa en `Hero.tsx`

La skill define la técnica **Double-Bezel** (outer shell + inner core). En `Hero.tsx` líneas 28-30:
```tsx
{/* Outer Shell */}
<div className="relative p-2 rounded-[2.5rem] bg-secondary/20 border border-border/40 shadow-soft">
  {/* Inner Core */}
  <div className="relative overflow-hidden rounded-[calc(2.5rem-0.5rem)] bg-muted aspect-[4/5] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
```
La skill especifica exactamente `rounded-[2rem]` outer, `rounded-[calc(2rem-0.375rem)]` inner y `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`. El código usa `2.5rem` (variación premium aplicada al brief de Cortina Studio).

La skill también especifica cubic-bezier `[0.32, 0.72, 0, 1]` — en `Hero.tsx` línea 24:
```tsx
transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
```

La skill prohíbe `h-screen` y exige `min-h-[100dvh]` — en `Hero.tsx` línea 12:
```tsx
className="relative min-h-[100dvh] flex items-center..."
```

#### `design-taste-frontend` — Evidencia en arquitectura de componentes

La skill exige:
- RSC por defecto, `"use client"` solo para interactividad → `Hero.tsx` tiene `'use client'` porque usa `useTranslations` y Framer Motion. El resto de secciones son RSC.
- `strokeWidth` global en iconos → los componentes usan `strokeWidth={1.75}` (punto dulce especificado en AGENTS.md, derivado de la skill)
- `min-h-[100dvh]` para secciones full-height → Hero.tsx lo aplica
- Grid sobre flexbox math → todos los layouts usan `grid grid-cols-1 lg:grid-cols-2`

#### `full-output-enforcement` — Guardrail de sesión

Esta skill no deja evidencia en el código pero es vital como guardrail operativo: impide que Claude Code truncase los componentes con `// rest of code here` o `// similar pattern`. Sin esta skill, componentes como `ReelsCarousel.tsx` (el más complejo, con lógica de carrusel, dots, AnimatePresence y overlay slide-up) podrían haber sido entregados incompletos.

#### `stitch-design-taste` — El archivo DESIGN.md

Existe `wordpress/plugins/.../stitch-design-taste/DESIGN.md` (el template de output de la skill). Indica que esta skill fue invocada para generar una especificación semántica del sistema de diseño. Ese archivo DESIGN.md sirve como entrada para Google Stitch si se quiere generar nuevas pantallas alineadas con la identidad de Cortina Studio sin necesidad de describir cada regla manualmente.

#### `redesign-existing-projects` — Iteraciones de mejora

El hecho de que los componentes muestren patrones premium consistentes (eyebrow + H2 + subtitle + divider en cada sección, variantes de fondo alternadas, Double-Bezel en imágenes) sugiere que esta skill fue usada en sesiones de refinamiento para auditar y elevar secciones que partieron de una primera versión más genérica.

---

### Por qué las Skills son vitales para la fábrica

| Skill | Rol en la fábrica |
|---|---|
| `high-end-visual-design` | Garantiza que cualquier componente nuevo —para este cliente o para el siguiente— salga con la misma calidad visual sin necesidad de instrucciones ad-hoc |
| `design-taste-frontend` | Bloquea los anti-patrones más comunes de los LLMs (layouts centrados genéricos, Inter font, 3-column equal grids, h-screen) antes de que aparezcan en el código |
| `full-output-enforcement` | Elimina la deuda técnica silenciosa: ningún componente queda con `// TODO implement` o código truncado |
| `stitch-design-taste` | Permite extender el sistema de diseño a Google Stitch para generar nuevas pantallas o variantes manteniendo la coherencia visual sin describir cada regla desde cero |
| `redesign-existing-projects` | Permite auditar y elevar secciones que el cliente pide agregar en versiones futuras sin romper la coherencia del sistema actual |

Las 3 skills no activas (`minimalist-ui`, `industrial-brutalist-ui`) quedan disponibles para proyectos futuros de la fábrica con estéticas distintas (un SaaS de datos, un portfolio de arquitectura) — la fábrica funciona para cualquier cliente, no solo para el estilo editorial de Cortina Studio.

---

## 10. RESUMEN DE ARCHIVOS POR ESTADO

### ✅ Archivos completos y correctos

```
lib/wordpress/client.ts
lib/wordpress/config.ts
lib/wordpress/tags.ts
lib/wordpress/index.ts
lib/wordpress/README.md
app/api/revalidate/route.ts
wp-config.json
.env.example
codegen.ts
scripts/fetch-schema.mjs
lib/graphql/queries/getHome.graphql
lib/graphql/queries/getProyectos.graphql
lib/graphql/schema.json
lib/graphql/generated/index.ts
wordpress/plugins/cortinastudio-wpgraphql-bridge/cortinastudio-wpgraphql-bridge.php
wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json
components/motion/ (3 archivos)
components/layout/ (Header, Footer)
components/sections/ (Hero, ProblemsSection, ReelsSection, ReelsCarousel, ProcessSection)
components/ui/ReelCard.tsx
messages/es.json
messages/en.json
tailwind.config.ts
middleware.ts
i18n/request.ts
```

### ❌ Archivos que faltan (Fase 3 y 4)

```
lib/wordpress/getHome.ts          ← BLOQUEANTE para Fase 4
lib/wordpress/getProyectos.ts     ← BLOQUEANTE para Fase 4
lib/validators/                   ← Schemas Zod de repeaters (recomendado)
```

### 🔄 Archivos que cambiarán en Fase 4

```
app/[locale]/page.tsx             ← Añadir awaits a los fetchers + props a secciones
components/sections/Hero.tsx      ← Recibir props de WP (heroTitle, heroImage, etc.)
components/sections/ProblemsSection.tsx  ← Recibir ProblemCard[] desde WP
components/sections/ReelsSection.tsx    ← Recibir reels[] desde WP
components/sections/ProcessSection.tsx  ← Recibir steps[] y rotatingWords[] desde WP
```

---

*Archivo generado por análisis de Claude Code sobre: AGENTS.md, Plan/PLANv1.md, Plan/PLANv2.md, MemoriaFase2.md (fragmento), estructura de archivos, contenido de código existente, y SKILL.md de cada skill instalada.*
