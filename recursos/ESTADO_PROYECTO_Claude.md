# ESTADO DEL PROYECTO — Analisis Claude
> Actualizado: 2026-05-13 | Modelo: Claude Opus 4.7 | Rama: main

Este documento contrasta lo que `CLAUDE.md` y las skills bajo `.claude/skills/` establecen como estandar de fabrica contra el estado real del repositorio. Responde tres preguntas: ¿que se hizo?, ¿que ya no aplica?, ¿que falta?.

> **Nota.** Este repo es la **base estandar replicable** de una fabrica de sitios premium. Cortina Studio es el primer cliente real ocupando los slots de configuracion. "Finalizar Cortina Studio" = validar end-to-end que el motor funciona. Una vez completado, el repo queda listo para clonar y replicar a futuros clientes.

---

## 1. RESUMEN EJECUTIVO

| Fase | Plan | Estado Real |
|------|------|-------------|
| **Fase 0** — Spec SDD `001-plan-inicial` | ✅ Completa | ✅ Completa (`docs/specs/001-plan-inicial/{proposal,task}.md`) |
| **Fase 1** — Base de fabrica (infraestructura) | ✅ Completa | ✅ Completa (con 4 desviaciones documentadas — todas mejoras) |
| **Fase 2** — Backend WordPress | ✅ Completa | ✅ Completa (con cambio de enfoque critico: plugin propio v3.0.0) |
| **Fase 3** — Queries y fetchers | ⏳ En curso | 🔶 Parcial (queries + codegen ✓ · fetchers ✗ · Options Page ✗) |
| **Fase 4** — Conectar componentes | ⏳ Pendiente | ❌ No iniciada |
| **Fase 5** — QA y replicacion | ⏳ Pendiente | ❌ No iniciada |
| **UI / Componentes** | Fuera de fases del SDD | ✅ Completa (bonus: todo el layout construido antes de conectar WP) |

**Punto de bloqueo actual:** los fetchers (`getHome.ts`, `getProyectos.ts`, `getGeneral.ts`) no existen. Sin ellos, Fase 4 no puede arrancar.

---

## 2. FASE 1 — BASE DE FABRICA

### ✅ Completado (coincide con la spec)

| Archivo / Elemento | Descripcion |
|---|---|
| `lib/wordpress/client.ts` | `wpFetch()` con `fetch` nativo de Next 14, tags + revalidate |
| `lib/wordpress/config.ts` | Carga y valida `wp-config.json` con Zod |
| `lib/wordpress/tags.ts` | Constantes `WP_TAGS` (`wp:home`, `wp:proyectos`, `wp:general`) |
| `lib/wordpress/index.ts` | Barrel export |
| `lib/wordpress/README.md` | Playbook breve de la capa |
| `app/api/revalidate/route.ts` | Endpoint `POST` con validacion de secret, revalidacion por tags |
| `wp-config.json` | Contrato de datos completo (endpoint, CPTs, fields, iconMap) |
| `.env.example` | 4 variables estandar documentadas |
| `lib/graphql/queries/` | Carpeta creada con `.gitkeep` |
| `lib/graphql/generated/` | Carpeta creada con `.gitkeep` |
| `tsconfig.json` | `resolveJsonModule: true` y `esModuleInterop: true` confirmados |

### ⚠️ Desviaciones documentadas (mejoras sobre la spec original)

**1. `codegen.ts` — Cambio de fuente de schema**

La spec / PLANv2 proponia apuntar codegen directo al endpoint:
```ts
schema: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
```

Estado real:
```ts
schema: 'lib/graphql/schema.json',  // archivo local
```

**Por que cambio:** algunos servidores PHP (staging con Traefik/Docker) devuelven un BOM (`﻿`) al inicio de las respuestas JSON. `@graphql-tools/url-loader` falla al parsear ese JSON. La solucion estable fue descargar el schema a un archivo local y que codegen lo lea desde ahi. Se anadio `scripts/fetch-schema.mjs` para este paso.

**2. Un solo archivo generado en vez de dos**

Plan original:
```
lib/graphql/generated/types.ts       ← @graphql-codegen/typescript
lib/graphql/generated/operations.ts  ← import-types preset
```

Estado real:
```
lib/graphql/generated/index.ts  ← todo junto (typescript + typescript-operations + typed-document-node)
```

**Por que cambio:** el preset `import-types` requiere `@graphql-codegen/import-types-preset` que no estaba instalado y generaba error `Unable to find preset`. La solucion fue fusionar los tres plugins en un unico archivo.

**3. Parseo manual de `.env.local` en `codegen.ts`**

`codegen.ts` corre fuera del contexto de Next.js, asi que `process.env` no incluye `.env.local`. Se parsea manualmente para no instalar `dotenv` como dependencia innecesaria.

**4. `scripts/fetch-schema.mjs` — no estaba en el plan original**

Archivo adicional que hace introspeccion al endpoint de WordPress y guarda el resultado en `lib/graphql/schema.json`. Resuelve el problema del BOM. Scripts en `package.json`:
```
"codegen"         → fetch-schema + genera
"schema:fetch"    → solo actualiza schema.json
"codegen:watch"   → observa cambios usando el schema.json existente
```

### ❌ Lo que la spec menciona y NO existe

| Elemento | Estado |
|---|---|
| `lib/validators/` | No creada. La spec la menciona para schemas Zod de formularios y repeaters. Sigue siendo recomendable cuando se creen los fetchers |
| `lib/utils.ts` | ✅ Si existe (`cn()`, helpers) |

---

## 3. FASE 2 — BACKEND WORDPRESS

### ✅ Completado (con cambio de enfoque critico)

| Elemento | Estado |
|---|---|
| Plugin `cortinastudio-wpgraphql-bridge` v3.0.0 | Instalado en WP, funcional |
| CPT `proyectos` | Expuesto como `Proyecto` / query `proyectos` (slug real plural) |
| CPT `home-singleton` | Expuesto como `HomeSingleton` / query `homeSingletons` (slug real `home-singleton`, NO `home`) |
| Meta fields escalares y repeaters | Validados en GraphiQL IDE |
| `bridge-fields.json` | Configurado con todos los meta keys (escalares + repeaters) |
| WPGraphQL | Instalado en WordPress |
| JetEngine | CPTs y meta fields creados |
| Rank Math | Instalado (SEO con integracion GraphQL nativa) |
| WP Webhooks (Cozmoslabs) | Instalado para revalidacion saliente |

### 🔄 Cambio de enfoque critico — Plugin propio vs `functions.php`

**La spec proponia** (en este orden):
1. Activar modulo "JetEngine WPGraphQL Integration" dentro de JetEngine.
2. Si no existe, usar `functions.php` con `register_post_type_args` + `graphql_register_types`.

**Lo que realmente paso:** el modulo "JetEngine WPGraphQL Integration" **no existe** en JetEngine 3.8+. Tampoco como add-on descargable. La opcion de `functions.php` funcionaria pero rompe la promesa de fabrica (cada cliente = codigo PHP diferente en el tema).

**Solucion adoptada:** se construyo el plugin `cortinastudio-wpgraphql-bridge` que:
- **Bloque 1 (CPTs):** filtro `register_post_type_args` con lista negra — cualquier CPT no nativo de WP se expone automaticamente a WPGraphQL. Sin tocar `functions.php`.
- **Bloque 2 (Meta fields):** lee `bridge-fields.json` y llama `register_graphql_field` por cada meta key.
- **Panel admin:** `Settings → WPGraphQL Bridge` muestra estado y permite escanear posts.

El plugin paso por 6 versiones (zips v1→v6 en `wordpress/plugins/`) antes de estabilizar en v3.0.0. Esto es historial; lo activo es v3.0.0.

### ⚠️ Discrepancias con la spec en plugins

| Plugin de la spec | Estado real |
|---|---|
| `JetEngine WPGraphQL Integration` (modulo) | No existe — reemplazado por el plugin propio |
| `WPGraphQL SEO` (Ash Hitchcock) | Descontinuado — reemplazado por **Rank Math** con integracion GraphQL nativa |
| `WPGraphQL Smart Cache` | No instalado (caching opcional, no critico) |
| `Polylang + WPGraphQL for Polylang` | No instalado (EN aplazado para v2 si el cliente lo necesita) |

### ⚠️ Slugs reales en JetEngine vs nombres en la spec

| Spec (proposal.md §4.3) | Real en JetEngine |
|---|---|
| CPT `home` | slug `home-singleton` |
| CPT `proyecto` | slug `proyectos` (plural) |
| Options Page `general` | slug `general` (coincide) |

Esto esta correctamente reflejado en `wp-config.json` (campo `cpt.home.slug` y `cpt.proyecto.graphqlPlural`). Solo es importante recordarlo al escribir las queries.

---

## 4. FASE 3 — QUERIES Y FETCHERS

### ✅ Completado parcialmente

| Elemento | Estado |
|---|---|
| `lib/graphql/queries/getHome.graphql` | ✅ Existe — pide todos los campos del `home-singleton` |
| `lib/graphql/queries/getProyectos.graphql` | ✅ Existe — pide todos los campos de `proyectos` |
| `lib/graphql/schema.json` | ✅ Existe — descargado desde el WP real |
| `lib/graphql/generated/index.ts` | ✅ Existe — codegen ejecutado correctamente |

### ❌ Pendiente (lo critico de Fase 3)

| Elemento | Descripcion |
|---|---|
| `lib/wordpress/getHome.ts` | Fetcher que llama a `wpFetch` con `GetHomeDocument` + parsea repeaters con Zod |
| `lib/wordpress/getProyectos.ts` | Fetcher para proyectos (sin repeaters; todos escalares en bridge-fields) |
| `lib/wordpress/getGeneral.ts` | Fetcher para la Options Page "General" de JetEngine |
| `lib/graphql/queries/getGeneral.graphql` | Query para la Options Page General (no creada todavia) |
| Options Page `general` expuesta a GraphQL | Pendiente: requiere `register_graphql_field('RootQuery', ...)` en el plugin |
| Schemas Zod de repeaters | `problemsCardsSchema`, `reelsSelectedSchema`, `processRotatingWordsSchema`, `processStepsSchema` — para validar JSON strings |

**Consecuencia directa:** sin los fetchers, Fase 4 no puede comenzar. `app/[locale]/page.tsx` actualmente llama a los componentes sin pasarles datos de WordPress.

---

## 5. FASE 4 — CONECTAR COMPONENTES

### ❌ No iniciada

`app/[locale]/page.tsx` actual (verificado linea por linea):
```tsx
// Sin await, sin fetchers, sin props de WP
export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
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

Los componentes de seccion usan datos estaticos internos (arrays hardcodeados como `PROBLEMS` en `ProblemsSection.tsx` lineas 18-51, traducciones via `next-intl`). Hasta que los fetchers existan, no hay datos de WP que pasar como props.

---

## 6. TRABAJO EXTRA — UI COMPLETA CONSTRUIDA

Esto no esta en ninguna fase del SDD original pero se completo antes de conectar WP. Los componentes ya cumplen los patrones de `diseno-fabrica` (eyebrow + H2 + subtitle + divider, `py-24 lg:py-32`, tokens semanticos, `focus-visible:ring-2`, `aria-labelledby`).

| Componente | Descripcion |
|---|---|
| `components/motion/FadeIn.tsx` | Scroll-triggered fade con easing global `[0.22, 1, 0.36, 1]` |
| `components/motion/FadeInStagger.tsx` | Grid/cards con stagger configurable |
| `components/motion/ProcessTitle.tsx` | Titulo con palabras rotantes (AnimatePresence) |
| `components/layout/Header.tsx` | Header fijo, scroll-aware |
| `components/layout/Footer.tsx` | Footer con 3 zonas (CTA strip + grid + bottom bar) |
| `components/sections/Hero.tsx` | Hero a 2 columnas, Double-Bezel en imagen |
| `components/sections/ProblemsSection.tsx` | Grid de cards con iconos lucide |
| `components/sections/ReelsSection.tsx` | Wrapper de carrusel |
| `components/sections/ReelsCarousel.tsx` | Carrusel con dots de navegacion |
| `components/sections/ProcessSection.tsx` | Timeline de pasos con rotating words |
| `components/ui/ReelCard.tsx` | Card de video con overlay slide-up |

---

## 7. QUE YA NO APLICA (obsoleto o superado)

| Item | Por que no aplica |
|---|---|
| `AGENTS.md` como manual normativo (~1.700 lineas) | Refactor SDD del 2026-05-13: contenido distribuido en 6 skills bajo `.claude/skills/`. Hoy `AGENTS.md` es **espejo byte-a-byte de `CLAUDE.md`** (para OpenCode/Cursor que no leen `CLAUDE.md`). Toda edicion a `CLAUDE.md` se replica obligatoriamente en `AGENTS.md` — ver seccion "Espejo" en `CLAUDE.md` |
| `recursos/plan/PLANv1.md` y `recursos/plan/PLANv2.md` | Archivos historicos eliminados del repo (visibles en `git status` como `D`). La spec SDD `docs/specs/001-plan-inicial/` los reemplaza |
| `recursos/MemoriaFase2.md` | Eliminado. Contenido migrado a `memoryLTS/memory_2026-04-29-1.md` (Fase 2 WP backend) |
| `recursos/system-rules.md` | Eliminado. Reglas distribuidas entre `CLAUDE.md` y las skills |
| "Activar modulo JetEngine WPGraphQL Integration" | No existe en JetEngine 3.8+. Plugin propio resuelve esto |
| "PHP en functions.php para exponer CPTs" | Reemplazado por el plugin — mejor para la fabrica |
| "Instalar WPGraphQL SEO" | Plugin descontinuado — Rank Math tiene integracion nativa |
| `codegen.ts` apuntando al endpoint directo | Reemplazado por schema.json local (BOM workaround) |
| Dos archivos generados (`types.ts` + `operations.ts`) | Un solo `index.ts` — evita el preset `import-types` |
| `lib/wordpress/mappers/*` separados | La spec proponia mappers en archivo aparte; sigue siendo razonable hacerlos inline dentro de cada fetcher hasta que la duplicacion lo justifique |

---

## 8. QUE FALTA POR HACER

### Prioridad inmediata — Completar Fase 3

```
1. Exponer la Options Page `general` a GraphQL en el plugin
   - register_graphql_field('RootQuery', 'general', { ... })
   - Resolver lee opciones desde wp_options (no post_meta)

2. Crear lib/graphql/queries/getGeneral.graphql

3. Ejecutar npm run codegen
   - Para regenerar tipos con getGeneral

4. Crear .env.local con credenciales reales del WordPress de produccion

5. Crear lib/wordpress/getHome.ts
   - import { wpFetch, WP_TAGS } from '@/lib/wordpress'
   - import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated'
   - Schemas Zod inline (o en lib/validators/) para: problemsCards, reelsSelected, processRotatingWords, processSteps
   - JSON.parse + .parse(Zod) en cada repeater
   - Devolver HomeData tipado al RSC

6. Crear lib/wordpress/getProyectos.ts
   - Similar patron con GetProyectosDocument + WP_TAGS.proyectos
   - Sin repeaters (todos escalares en bridge-fields.json)

7. Crear lib/wordpress/getGeneral.ts
   - Patron con GetGeneralDocument + WP_TAGS.general
   - Expone whatsappNumber y otros campos globales

8. (Recomendado) Crear lib/validators/
   - Mover los schemas Zod de repeaters aqui para reutilizacion entre fetchers y, eventualmente, formularios
```

### Siguiente — Fase 4

```
9.  Modificar app/[locale]/page.tsx
    - await getHome(locale), getProyectos(), getGeneral()
    - Pasar datos por props a Hero, ProblemsSection, ReelsSection, ProcessSection, Footer, Header

10. Actualizar interfaces de props de cada seccion
    - HeroProps con datos de WP (heroTitle, heroImage, etc.)
    - ProblemsSectionProps con ProblemCard[] (con icon resuelto via iconMap de wp-config.json)
    - ReelsSectionProps con Proyecto[]
    - ProcessSectionProps con steps[] y rotatingWords[]

11. Eliminar arrays estaticos hardcodeados en los componentes
    - PROBLEMS, REELS, STEPS, ROTATING_WORDS

12. Reemplazar numero WhatsApp hardcodeado por general.whatsappNumber

13. Configurar webhooks salientes finales en WordPress (WP Webhooks) apuntando a /api/revalidate
```

### Fase 5 — QA y replicacion

```
14. Validar revalidacion en todos los CPTs: cambio en home invalida wp:home, etc.
15. Validar fallback si WP esta caido (notFound() o cache stale)
16. Validar que los iconos del repeater problems_cards mapean correctamente a Lucide via iconMap
17. Exportar setup JetEngine (Tools → Export) y guardar el JSON en recursos/ como plantilla
18. Validar que un segundo proyecto puede conectarse a otro WP solo editando wp-config.json y .env.local
```

### Validacion tecnica final

```
- npx tsc --noEmit          → sin errores
- npm run lint              → sin errores
- npm run build             → exitoso con .env.local
- Publicar en WP → POST llega a /api/revalidate → pagina actualizada sin redeploy
- Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms
```

---

## 9. SKILLS — DOS CAPAS

Tras el refactor SDD del 2026-05-13, las skills viven en dos directorios con proposito distinto:

### 9.1 Skills de fabrica (propias del motor) — `.claude/skills/`

Son la implementacion modular de lo que antes era el manual `AGENTS.md`. Se cargan **solo cuando la tarea las requiere** (no por defecto).

| Skill | Trigger |
|---|---|
| `arquitectura-fabrica` | Estructura, stack, RSC, reglas TS/Tailwind, performance |
| `diseno-fabrica` | UI, tokens, secciones, tipografia, animaciones. Exige consultar `taste-design/` antes de proponer UI |
| `wordpress-bridge` | Plugin propio, `bridge-fields.json`, naming GraphQL, codegen, problemas conocidos |
| `data-layer` | `lib/wordpress/`, queries, fetchers tipados, Zod en repeaters, `/api/revalidate` |
| `i18n-fabrica` | next-intl, layouts, namespaces, patron labels delegadas |
| `replicacion-cliente` | Levantar un cliente nuevo (Fase 1-4) y reglas de oro |
| `save-session-memory` | Comando `/save-session-memory` — snapshot en `memoryLTS/` |

### 9.2 Skills de criterio estetico (terceros) — `.claude/skills/taste-design/`

Instaladas desde el repo `Leonxlnx/taste-skill`. Mismo set duplicado en `.opencode/skills/taste-design/` para soportar OpenCode/Cursor.

| Skill | Funcion | Uso real |
|---|---|---|
| `design-taste-frontend` | Senior UI/UX Engineer. Reglas metricas, arquitectura de componentes, anti-slop | **Activa** (RSC por defecto, `strokeWidth={1.75}`, `min-h-[100dvh]`) |
| `high-end-visual-design` | Double-Bezel, spring physics, asymmetric layouts | **Activa** (evidencia directa en `Hero.tsx`: outer shell `rounded-[2.5rem]` + inner core `rounded-[calc(2.5rem-0.5rem)]`, easing `[0.32, 0.72, 0, 1]`) |
| `full-output-enforcement` | Previene truncacion — codigo completo o nada | **Activa** (guardrail de sesion) |
| `stitch-design-taste` | Genera DESIGN.md para Google Stitch | **Parcialmente activa** (DESIGN.md generado en `.claude/skills/taste-design/stitch-design-taste/`) |
| `redesign-existing-projects` | Audita y mejora disenos existentes | **Posiblemente activa** (patrones premium consistentes en secciones) |
| `minimalist-ui` | Editorial limpio, paleta monocromatica | Baja actividad |
| `industrial-brutalist-ui` | UI cruda mecanica, tipografia suiza extrema | No activa (no aplica al brief de Cortina) |

### 9.3 Por que las skills son vitales para la fabrica

| Skill | Rol en la fabrica |
|---|---|
| Skills de fabrica (`.claude/skills/*`) | Carga selectiva de contexto: la sesion solo lee lo necesario para la tarea actual. Reduce token cost y elimina ruido |
| `high-end-visual-design` | Garantiza que cualquier componente nuevo —para este cliente o para el siguiente— salga con la misma calidad visual sin instrucciones ad-hoc |
| `design-taste-frontend` | Bloquea anti-patrones de LLMs (layouts centrados genericos, Inter font, 3-column equal grids, `h-screen`) |
| `full-output-enforcement` | Elimina deuda tecnica silenciosa: ningun componente queda con `// TODO implement` |
| `stitch-design-taste` | Permite extender el sistema a Google Stitch sin re-describir cada regla |
| `redesign-existing-projects` | Permite auditar y elevar secciones que el cliente pida agregar sin romper coherencia |

Las dos skills no activas (`minimalist-ui`, `industrial-brutalist-ui`) quedan disponibles para futuros clientes con esteticas distintas — la fabrica funciona para cualquier brief, no solo para el editorial de Cortina Studio.

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
CLAUDE.md
.claude/skills/*/SKILL.md
memoryLTS/memory.md (+ snapshots fechados)
docs/specs/001-plan-inicial/proposal.md
docs/specs/001-plan-inicial/task.md
```

### ❌ Archivos que faltan (Fase 3 y 4)

```
lib/graphql/queries/getGeneral.graphql   ← Necesario para Options Page General
lib/wordpress/getHome.ts                 ← BLOQUEANTE para Fase 4
lib/wordpress/getProyectos.ts            ← BLOQUEANTE para Fase 4
lib/wordpress/getGeneral.ts              ← BLOQUEANTE para whatsappNumber
lib/validators/                          ← Schemas Zod de repeaters (recomendado)
.env.local                               ← Credenciales reales del WP de produccion
```

### 🔄 Archivos que cambiaran en Fase 4

```
app/[locale]/page.tsx                    ← Anadir awaits a fetchers + props a secciones
components/sections/Hero.tsx             ← Recibir props de WP (heroTitle, heroImage, etc.)
components/sections/ProblemsSection.tsx  ← Recibir ProblemCard[] desde WP
components/sections/ReelsSection.tsx     ← Recibir reels[] desde WP
components/sections/ProcessSection.tsx   ← Recibir steps[] y rotatingWords[] desde WP
components/layout/Footer.tsx             ← Recibir general (whatsappNumber, redes, copyright)
components/layout/Header.tsx             ← Recibir general.navItems y brand
```

### 🗑️ Archivos eliminados (visibles en `git status` pendientes de commit)

```
recursos/ESTADO_PROYECTO.md
recursos/MemoriaFase2.md
recursos/plan/PLANv1.md
recursos/plan/PLANv2.md
recursos/system-rules.md
```

---

*Documento generado por analisis de Claude Code sobre: `CLAUDE.md`, `.claude/skills/*/SKILL.md`, `docs/specs/001-plan-inicial/{proposal,task}.md`, `memoryLTS/memory_2026-04-29-1.md`, `memoryLTS/memory_2026-05-13-1.md`, estructura de archivos, y contenido real de codigo existente.*
