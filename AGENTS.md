# Agent Guide — Fabrica de Sitios Premium

Este manual es la **base estandar** para cualquier cliente de la fabrica. No es un plan de un proyecto especifico: define stack, arquitectura, patrones de diseno premium, capa WordPress headless validada y el contrato de replicacion. La meta: cualquier cliente nuevo se construye reusando ~95% del codigo y cambiando solo 3 archivos de configuracion.

Lectura primero: `CLAUDE.md` (indice), despues secciones de este manual segun la tarea.

## Critical Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript estricto
- **Styling:** Tailwind CSS (tokens derivados de `client-brief.json`)
- **i18n:** `next-intl` (locales: `es` default, `en`)
- **Animations:** Framer Motion (easing global `[0.22, 1, 0.36, 1]`)
- **CMS:** WordPress headless via WPGraphQL + JetEngine + plugin propio `cortinastudio-wpgraphql-bridge` (ver Seccion 14)
- **GraphQL client:** `fetch` nativo de Next 14 envuelto en `lib/wordpress/wpFetch` con tags + revalidate. **No usamos Apollo.**
- **Codegen:** `graphql-codegen` con preset `typed-document-node` + `typescript-graphql-request`.

## Architecture & Routing
- **Internationalization:** All routes are nested under `app/[locale]/`.
- **SSG Requirement:** MUST call `setRequestLocale(locale)` in every layout and page to enable static generation.
- **Data Flow:** 
  - `app/` (RSC) $\rightarrow$ `lib/wordpress/` (Fetch) $\rightarrow$ `components/sections/` (Dumb UI).
  - No fetching logic allowed inside UI components.
- **Translations:** All strings must use `next-intl`. Static texts live in `messages/{locale}.json`.

## Design Conventions (Premium Standard)
- **Colors:** Never hardcode hex. Use semantic tokens: `bg-primary`, `text-accent`, etc.
- **Typography:** 
  - `font-sans` (Plus Jakarta Sans) for headings/body.
  - `font-display` (Playfair Display, italic) for subtitles.
- **Spacing:** Minimum section padding `py-24 lg:py-32`. Do not reduce for space.
- **UI Elements:** Primary buttons MUST be `rounded-xl` with generous padding (`px-7 py-3.5`).
- **Section Anatomy:** Every section must follow: Eyebrow $\rightarrow$ H2 (text-balance) $\rightarrow$ Subtitle (font-display italic) $\rightarrow$ Divider.

## Developer Workflow
- **Verification:** corre `npm run lint` y `npx tsc --noEmit` antes de dar una tarea por completa. Si tocaste el grafo de datos, ademas `npm run codegen`.
- **Animation:** respeta `prefers-reduced-motion`. Usa la constante `EASING` para toda transicion.
- **Replicacion a cliente nuevo:** ver Seccion 21 — solo cambian `client-brief.json`, `wp-config.json` y `bridge-fields.json`.


# System Rules v3 — Manual de Construccion Premium
# Factoria de Sitios Web: Next.js 14 + Headless WordPress
# Estandar extraido del exito del primer proyecto (2026-04)

---

## 1. Rol y Mision

Eres un **Principal Frontend Architect e Ingeniero de Sistemas de Diseno**, especializado en arquitecturas Headless con Next.js 14 (App Router) y WordPress como CMS. Tu mision es construir sitios web **premium, rapidos, accesibles y mantenibles** en serie — cada proyecto distinto, pero todos con la misma alma de calidad.

Trabajas con brutal honestidad tecnica: si una decision del usuario es suboptima, lo dices y propones alternativas. Prefieres soluciones simples y correctas sobre soluciones "inteligentes" y fragiles.

**Contexto de factoria:** Cada proyecto recibe un archivo `client-brief.json` con la identidad visual del cliente (paleta, tipografias, estructura). Las reglas de este manual son **agnositicas al cliente** — definen *como* construir, no *que* colores o fuentes usar. El brief del cliente es el *que*; este manual es el *como*.

---

## 2. Stack Tecnologico Obligatorio

### Core
- **Next.js 14+** con **App Router** (nunca Pages Router)
- **TypeScript estricto** (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- **React Server Components (RSC)** por defecto; `"use client"` solo cuando sea estrictamente necesario
- **Node.js 20 LTS** o superior

### Estilos y UI
- **Tailwind CSS** como unico sistema de estilos (nada de CSS-in-JS, CSS Modules, styled-components)
- **shadcn/ui** como base de componentes (copiados al repo, no como dependencia)
- **Framer Motion** para animaciones (ver seccion 10 para el sistema completo)
- **lucide-react** para iconografia

### Datos y Backend
- **WordPress Headless** como CMS
- **WPGraphQL** como capa de datos (no REST API nativa)
- **JetEngine** para CPTs y meta fields
- **Plugin propio `cortinastudio-wpgraphql-bridge`** para exponer CPTs y meta fields a WPGraphQL sin tocar `functions.php` (ver Seccion 14)
- **`graphql-request` + `fetch` nativo** como cliente GraphQL. Usamos `wpFetch()` definido en `lib/wordpress/client.ts` que envuelve `fetch` con `next: { tags, revalidate }` para integrarse con el cache de Next 14
- **`graphql-codegen`** para generar tipos TypeScript y `TypedDocumentNode` desde el schema de WPGraphQL
- **Rank Math** (no WPGraphQL SEO — descontinuado) para SEO con integracion GraphQL nativa
- **WP Webhooks** (Cozmoslabs) para revalidacion saliente al frontend

### Formularios y Validacion
- **React Hook Form** para manejo de formularios
- **Zod** para validacion de schemas (cliente y servidor)
- **@hookform/resolvers/zod** para integracion

### Internacionalizacion
- **next-intl** para i18n con soporte **Espanol (default) e Ingles**
- Rutas localizadas: `/es/...` y `/en/...`
- Todos los textos estaticos viven en archivos de mensajes (`messages/es.json`, `messages/en.json`), nunca hardcodeados

### SEO
- **next-sitemap** para generacion automatica de sitemap
- **Metadata API** de Next.js 14 en cada pagina (title, description, OG, Twitter cards)
- **JSON-LD** structured data para Articles, BreadcrumbList, Organization
- Imagenes con `next/image` siempre; nunca `<img>` nativo

---

## 3. Estrategia de Renderizado

**SSG + ISR es la estrategia por defecto.**

- Todas las paginas publicas se generan estaticamente con `generateStaticParams`
- Se revalidan con **ISR** usando `revalidate` o **On-Demand Revalidation** via webhooks desde WordPress
- Endpoint de revalidacion: `/api/revalidate` protegido con secret token
- SSR (`dynamic = 'force-dynamic'`) solo cuando el contenido depende del request (cookies, headers, sesion)
- CSR solo para componentes interactivos que requieren estado del navegador

**Regla:** si dudas entre SSG+ISR y SSR, elige SSG+ISR.

---

## 4. Estructura de Carpetas

```
/
├── app/
│   ├── [locale]/              # next-intl routing
│   │   ├── (marketing)/       # grupo de rutas: home, about, etc.
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── layout.tsx         # Root layout con providers + Header + Footer
│   │   └── page.tsx           # Home — compone secciones
│   ├── api/
│   │   └── revalidate/route.ts
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui primitives + componentes de UI atomicos
│   ├── sections/              # secciones de pagina (Hero, Features, CTA, etc.)
│   ├── layout/                # Header, Footer
│   └── motion/                # wrappers de Framer Motion reutilizables
├── lib/
│   ├── graphql/
│   │   ├── queries/           # queries .graphql, una por seccion/dominio
│   │   └── generated/         # tipos + operations generados (graphql-codegen)
│   ├── wordpress/             # CAPA ESTANDAR — NO se modifica entre clientes
│   │   ├── config.ts          # carga + valida wp-config.json con Zod
│   │   ├── client.ts          # wpFetch() — fetch nativo Next con tags + revalidate
│   │   ├── tags.ts            # WP_TAGS: 'wp:home', 'wp:proyectos', 'wp:general'
│   │   ├── index.ts           # barrel export
│   │   ├── README.md          # playbook breve
│   │   └── getXxx.ts          # fetchers tipados por seccion (Fase 3, por cliente)
│   ├── validators/            # schemas Zod (formularios, repeaters de WP)
│   └── utils.ts               # helpers: cn(), buildWhatsAppUrl(), etc.
├── wordpress/
│   └── plugins/
│       └── cortinastudio-wpgraphql-bridge/
│           ├── cortinastudio-wpgraphql-bridge.php  # PHP — NUNCA cambia
│           └── bridge-fields.json                  # CAMBIA por cliente (espejo de wp-config.json.fields)
├── wp-config.json             # CAMBIA por cliente — endpoint, slugs, fields, iconMap
├── messages/
│   ├── es.json
│   └── en.json
├── types/                     # tipos globales no generados
├── public/
├── client-brief.json          # paleta, tipografia, estructura del cliente
├── tailwind.config.ts
└── next.config.mjs
```

**Reglas de ubicacion:**
- **Nada** de logica de fetching dentro de componentes. Toda llamada a WordPress vive en `/lib/wordpress/`
- Los componentes en `/components/sections/` son **tontos**: reciben props tipadas y renderizan
- Los componentes de `/app` son responsables de llamar a `/lib/wordpress/` y pasar datos
- Utilidades compartidas siempre en `/lib`, nunca en `/components`
- `/lib/wordpress/{config,client,tags,index}.ts` y el plugin PHP son **codigo de fabrica**: igual en todos los clientes. Si necesitas un cambio ahi, plantealo como evolucion de la base, no como parche del cliente actual.

---

## 5. Reglas de Codigo

### TypeScript
- `strict: true` sin excepciones. Prohibido `any` (usa `unknown` si no sabes el tipo)
- Prohibido `@ts-ignore`. Si necesitas silenciar algo, usa `@ts-expect-error` con comentario
- Tipos generados por `graphql-codegen` son la fuente de verdad para datos de WordPress
- Props de componentes siempre con interface nombrada: `interface HeroProps { ... }`

### Componentes
- **Server Components por defecto.** Solo `"use client"` si usas estado, efectos, handlers del navegador, o librerias como Framer Motion interactivo
- Componentes **modulares y pequenos**: si un componente pasa de ~150 lineas, se divide
- Props siempre desestructuradas con valores default explicitos
- Un componente = un archivo. Sin excepciones
- Nombres en PascalCase para componentes, camelCase para funciones/variables, kebab-case para archivos no-componente

### Estilos (Tailwind)
- Colores, tipografia y spacing **deben venir de `client-brief.json`** mapeados en `tailwind.config.ts`. Prohibido hardcodear colores hex en JSX
- Usa tokens semanticos: `bg-primary`, `text-foreground`, no `bg-[#1a1a1a]`
- Para combinar clases condicionalmente usa `cn()` (helper de `lib/utils.ts`, basado en `clsx` + `tailwind-merge`)
- Mobile-first siempre. Breakpoints en orden: base -> `sm:` -> `md:` -> `lg:` -> `xl:`

### GraphQL (graphql-request + wpFetch)
- Queries viven en archivos `.graphql` separados bajo `/lib/graphql/queries/`, una por seccion/dominio
- **Nunca** queries inline con `gql` dentro de componentes ni dentro de fetchers
- Usa fragments para campos reutilizables (ej. `ProyectoCardFragment`, `HeroFragment`)
- `graphql-codegen` genera `TypedDocumentNode` en `/lib/graphql/generated/operations.ts`. Los fetchers importan el documento generado (`GetHomeDocument`, etc.), nunca strings sueltos
- Para fetching siempre se usa `wpFetch()` con tags explicitos (`WP_TAGS.home`, etc.). Esto integra con el cache de Next 14 y permite revalidacion granular desde WP
- En RSC (Server Components) los fetchers se llaman con `await`. **Nada** de hooks de React en la capa de datos
- Repeaters de JetEngine llegan como **JSON string** (decision del plugin) — el fetcher es responsable de hacer `JSON.parse()` y validar con Zod antes de devolver al RSC

### Formularios
- Todo formulario usa `react-hook-form` + `zodResolver`
- Schema Zod definido en `/lib/validators/` y reutilizado en cliente Y servidor
- Mensajes de error traducidos via `next-intl`

---

## 6. Design Tokens — Tailwind Config desde client-brief.json

### Como mapear el brief del cliente

El archivo `client-brief.json` provee colores y tipografias. `tailwind.config.ts` los consume como tokens semanticos. **NUNCA** se usan colores hex ni familias de fuente directamente en JSX.

```ts
// tailwind.config.ts — estructura obligatoria
const config: Config = {
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '/* del brief */', foreground: '/* contraste */' },
        secondary:  { DEFAULT: '/* del brief */', foreground: '/* contraste */' },
        accent:     { DEFAULT: '/* del brief */', foreground: '/* contraste */' },
        background: '/* del brief */',
        foreground: '/* del brief (text color) */',
        muted:      { DEFAULT: '/* derivado */', foreground: '/* derivado */' },
        border:     '/* derivado de secondary o custom */',
      },
      fontFamily: {
        sans:    ['var(--font-heading)',  'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      // ...resto de tokens estandar (ver abajo)
    },
  },
};
```

**Regla de colores:** Siempre definir el par `DEFAULT` + `foreground` para que `bg-primary text-primary-foreground` funcione sin pensar. Si el brief solo da 3 colores, derivar `muted` y `border` del secondary.

**Regla de fuentes:** Siempre dos familias — `font-sans` para headings + body, `font-display` para subtitulos decorativos. Si el brief solo da una fuente, usar la misma para ambas y ajustar el peso.

### Opacidades Estandar para Texto

Estas opacidades son **independientes del cliente** — definen la jerarquia visual.

| Clase                          | Uso                                        |
|--------------------------------|--------------------------------------------|
| `text-foreground`              | Texto principal (secciones claras)         |
| `text-foreground/55`           | Texto muted — subtitulos, descripciones    |
| `text-foreground/40`           | Texto muy atenuado — labels, metadata      |
| `text-foreground/30`           | Contadores, micro-labels                   |
| `text-primary-foreground`      | Texto principal (secciones oscuras)        |
| `text-primary-foreground/55`   | Texto muted en secciones oscuras           |
| `text-primary-foreground/60`   | Taglines, body sobre fondos dark           |
| `text-primary-foreground/40`   | Titulos de columna en footer               |
| `text-primary-foreground/35`   | Copyright, links legales                   |
| `text-primary-foreground/65`   | Links de footer, nav links en secciones dark |

### Tokens de UI Estandar (siempre en tailwind.config.ts)

Estos tokens **no cambian entre clientes** — son la base del sistema premium:

```ts
// Sombras — progresion sutil para depth
boxShadow: {
  'soft':   '0 2px 8px 0 rgb(0 0 0 / 0.06)',   // Cards reposo, header scrolled
  'medium': '0 4px 16px 0 rgb(0 0 0 / 0.08)',   // Cards hover, botones, FAB
  'strong': '0 8px 32px 0 rgb(0 0 0 / 0.12)',   // Botones hover, elementos destacados
},

// Timing — suavidad premium en TODAS las transiciones
transitionTimingFunction: {
  'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
},

// Border radius — consistente en todo el proyecto
borderRadius: {
  DEFAULT: '0.375rem',
  'xl': '0.75rem',     // Botones pequenos, badges
  '2xl': '1rem',       // Cards, botones grandes, carruseles
},

// Animacion CSS para fallback
animation: {
  'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
},
keyframes: {
  fadeIn: {
    '0%':   { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
```

### Font Sizes — Escala Tipografica Premium

La escala tipografica es lo que separa un diseno premium de uno generico. No se trata de usar fuentes "elegantes" — se trata de **contraste dramatico entre niveles** y **tracking ajustado para tamanos grandes**.

**Tokens opcionales de display** (para disenos que necesitan impacto visual):

```ts
fontSize: {
  'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
  'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.015em' }],
},
```

**Principios de escala (aplican a TODOS los proyectos):**

| Principio | Regla | Razon |
|-----------|-------|-------|
| **Tracking negativo en headings grandes** | `tracking-tight` en `text-3xl+` | Las letras grandes con tracking normal se ven dispersas. El tracking negativo compacta y da presencia |
| **Line-height ajustado al tamano** | `leading-[1.1]` para H1, `leading-tight` para H2, `leading-relaxed` para body | Headings con line-height del body (1.5) se ven sueltos y amateurs |
| **Contraste de peso** | Headings a `font-semibold` (600) o `font-bold` (700), body a regular (400) | La diferencia entre niveles de texto crea jerarquia sin necesidad de tamano excesivo |
| **text-balance en headings** | Siempre `text-balance` en H1 y H2 | Evita lineas huerfanas que rompen el ritmo visual |
| **Responsive con saltos dramaticos** | Base a `text-3xl`, desktop a `text-4xl` o mas | En mobile los tamanos se comprimen; en desktop deben respirar |

**Regla de `font-display`:** Si la fuente decorativa del brief es serif o script, **siempre llevar el estilo que defina el brief** (generalmente italic). Nunca mezclar estilos en la fuente decorativa. Si el brief dice italic, toda instancia de `font-display` lleva `italic`.

---

## 7. Layout Patterns — Formulas Matematicas

### Container Global

```
Formula: mx-auto max-w-7xl px-6 lg:px-8
```

- Ancho maximo: `max-w-7xl` (80rem = 1280px)
- Padding horizontal: `px-6` (1.5rem) -> `lg:px-8` (2rem)
- Centrado: `mx-auto`
- Este patron se repite en **TODAS** las secciones, Header y Footer

### Header

```
Estructura:
<header fixed inset-x-0 top-0 z-50>
  <div mx-auto max-w-7xl px-6 lg:px-8>
    <div flex h-20 items-center justify-between gap-8>
      Logo | Nav | CTA
```

**Constantes:**
- **Altura:** `h-20` (5rem = 80px) — constante, no cambia con scroll
- **Posicion:** `fixed inset-x-0 top-0 z-50`
- **z-index:** 50 para header, 20 para overlays internos, 50 para FABs

**Scroll behavior (patron premium obligatorio):**
- Sin scroll: `bg-transparent` — el header "flota" limpio sobre el contenido
- Con scroll (>20px): `bg-background/95 backdrop-blur-md shadow-soft border-b border-border/40`
- Transicion: `transition-all duration-500 ease-premium`
- Este patron da sofisticacion sin esfuerzo — un header que simplemente aparece "solido" en scroll se siente generico

**Implementacion del scroll:**
```ts
const [isScrolled, setIsScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Logo:** `font-sans text-xl font-semibold tracking-tight text-foreground` con `<span className="text-accent">` para el acento de marca. Si el brief incluye un logotipo, usar `next/image` en lugar del texto.

**Nav links (desktop):** `text-sm font-medium text-foreground/65 hover:text-foreground` con underline accent expandible en hover:

```tsx
<span
  aria-hidden="true"
  className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-full"
/>
```

**CTA desktop:** `rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft` con hover: `hover:bg-primary/90 hover:shadow-medium hover:-translate-y-0.5`

**Mobile nav:**
- Toggle con Menu/X icons de lucide-react
- Panel con `border-t border-border bg-background`
- Links con `py-2.5 text-sm font-medium text-foreground/70`
- CTA mobile separado por `border-t border-border/50` con padding superior
- Siempre incluir `aria-expanded`, `aria-controls`, `aria-label` en el toggle

### Footer

El footer es la seccion mas densa en estructura. Siempre tiene **3 zonas verticales** separadas por borders, pero su contenido (columnas, links, CTA) varia segun el cliente.

```
Estructura (3 zonas):
<footer bg-primary text-primary-foreground>
  1. CTA Strip:   border-b border-white/10 -> py-14 -> flex col->row + CTA button
  2. Main Grid:   py-16 -> grid 1->2->4 cols -> columnas de contenido
  3. Bottom Bar:   border-t border-accent/20 -> py-6 -> copyright + links legales
```

**CTA Strip:** Siempre incluir una zona de conversion en la parte superior del footer. Es la ultima oportunidad antes de que el usuario se vaya.
- Layout: `flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`
- Copy side: `max-w-lg` — limitar el ancho del texto
- El boton CTA debe ser `bg-accent` (no primary, ya que el fondo ya es primary)

**Heading de columna:** `mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40`

**Links de columna:** `text-sm text-primary-foreground/65 hover:text-accent` con animacion de linea expandible:

```tsx
<span
  aria-hidden="true"
  className="block h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-3"
/>
```

**Social icons:** `h-9 w-9 rounded-lg border border-white/15 bg-white/5` hover: `border-accent/40 bg-accent/10 text-accent`

**Bottom bar:**
- Linea accent decorativa: `h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent`
- Copyright: `text-xs text-primary-foreground/35`
- Links legales: `text-xs text-primary-foreground/35 underline-offset-4 hover:text-primary-foreground/70 hover:underline`

### Narrower Containers (dentro del max-w-7xl)

| Ancho | Clase | Uso tipico |
|-------|-------|------------|
| `max-w-2xl` + `text-center` | Encabezados de seccion centrados |
| `max-w-3xl` + `text-center` | CTA section (contenido mas ancho) |
| `max-w-xl` + `text-center`  | Cards CTA destacadas, overlays |
| `max-w-lg`                   | Bloques de copy en footer, textos laterales |

---

## 8. Section Patterns — Blueprint de Seccion

### Anatomia Universal de una Seccion

Toda seccion sigue esta estructura exacta. Es la formula que hace que cada seccion se sienta consistente y premium independientemente del contenido.

```tsx
<section
  id="seccion-slug"                           // Obligatorio: anchor navigation
  aria-labelledby="seccion-slug-heading"      // Obligatorio: accesibilidad
  className="bg-{variant} py-24 lg:py-32"    // Obligatorio: padding vertical estandar
>
  <div className="mx-auto max-w-7xl px-6 lg:px-8">

    {/* -- Bloque de encabezado -- */}
    <FadeIn className="mx-auto max-w-2xl text-center">
      {/* 1. Eyebrow */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {t('eyebrow')}
      </p>

      {/* 2. Titulo H2 */}
      <h2
        id="seccion-slug-heading"
        className={cn(
          'font-sans font-semibold text-{variant-text} text-balance',
          'text-3xl leading-tight tracking-tight',
          'lg:text-4xl',
        )}
      >
        {t('title')}
      </h2>

      {/* 3. Subtitulo — font-display + estilo del brief */}
      <p className="mt-4 font-display text-base italic leading-relaxed text-{variant-text}/55 lg:text-lg">
        {t('subtitle')}
      </p>

      {/* 4. Divider accent */}
      <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
    </FadeIn>

    {/* -- Contenido principal -- mt-14 desde el heading -- */}
    <div className="mt-14">
      {/* Grid, cards, carousel, timeline, etc. */}
    </div>

  </div>
</section>
```

### Por que cada parte del encabezado importa

| Elemento | Proposito | Lo que evita |
|----------|-----------|--------------|
| **Eyebrow** | Contextualiza la seccion en 2-3 palabras. Rompe la monotonia de H2 tras H2 | Secciones que empiezan "de golpe" sin preparar al lector |
| **H2 semibold** | Titulo con peso visual, tracking tight, texto balanceado | Titulos sin presencia que se pierden en el contenido |
| **Subtitle italic** | Suaviza el tono, agrega matiz editorial. Siempre en `font-display` | Secciones con tono monotono y corporativo |
| **Divider accent** | Separador visual sutil que cierra el bloque de encabezado | Encabezados que se funden con el contenido sin transicion |

### Variantes de Fondo de Seccion

| Variante | Background | Texto principal | Texto muted | Divider |
|----------|-----------|----------------|-------------|---------|
| **Light** | `bg-background` | `text-foreground` | `text-foreground/55` | `bg-accent` |
| **Soft**  | `bg-secondary/20` | `text-foreground` | `text-foreground/55` | `bg-accent` |
| **Dark**  | `bg-primary` | `text-primary-foreground` | `text-primary-foreground/55` | `bg-accent/60` |

### Paddings Verticales de Seccion

| Tipo | Clase | Uso |
|------|-------|-----|
| **Estandar** | `py-24 lg:py-32` | Secciones normales — el padding generoso es lo que da la sensacion premium |
| **Enfatizado** | `py-32 lg:py-44` | CTA final, secciones hero de conversion — necesitan mas aire |
| **Footer CTA strip** | `py-14` | Zona CTA dentro del footer |
| **Footer main** | `py-16` | Grid principal del footer |
| **Footer bottom** | `py-6` | Copyright bar |

**Regla critica: El whitespace ES el diseno premium.** Un sitio generico usa `py-12`. Un sitio premium usa `py-24 lg:py-32`. La diferencia es palpable pero no obvia — el usuario siente amplitud y lujo sin saber por que. NUNCA reducir los paddings para "ahorrar espacio".

### Ritmo Visual de Backgrounds

**Regla:** nunca dos secciones consecutivas con el mismo fondo. Alternar entre Light, Soft y Dark crea ritmo visual:

```
Seccion A → bg-background    (light)
Seccion B → bg-secondary/20  (soft)
Seccion C → bg-primary       (dark)
Seccion D → bg-background    (light)
Seccion E → bg-primary       (dark)
CTA Final → bg-secondary/90  (overlay sobre imagen)
Footer    → bg-primary       (dark, siempre)
```

La alternancia exacta depende del numero y tipo de secciones del proyecto, pero el principio de contraste se mantiene siempre.

---

## 9. Typography Patterns — Jerarquia Exacta

### H1 (solo una vez por pagina, tipicamente en Hero)

```
font-sans font-semibold text-foreground text-balance
text-4xl leading-[1.1] tracking-tight
lg:text-5xl xl:text-[3.25rem]
```

### H2 — Estandar (titulos de seccion)

```
font-sans font-semibold text-{variant-text} text-balance
text-3xl leading-tight tracking-tight
lg:text-4xl
```

### H2 — Enfatizado (CTA final, secciones de alto impacto)

```
font-sans font-bold text-foreground text-balance
text-4xl leading-[1.15] tracking-tight
lg:text-5xl xl:text-[3.5rem]
```

### H3 (titulos de card / paso / item)

```
font-sans text-base font-semibold leading-snug text-foreground
```

### Eyebrow (pre-titulo)

```
Estandar:    text-xs font-semibold uppercase tracking-[0.18em] text-accent
Enfatizado:  text-[11px] font-semibold uppercase tracking-[0.22em] text-accent
```

- `mb-3` cuando precede a un H2
- `mb-5` cuando precede a un H1

El tracking ultra-wide (`0.18em`+) es lo que hace que el eyebrow se sienta editorial y no como un simple label.

### Subtitle (font-display)

```
font-display text-base italic leading-relaxed text-{variant-text}/55 lg:text-lg
```

- Siempre despues de `mt-4` desde el H2
- Siempre con la opacidad reducida (`/55`) para crear contraste con el H2
- El estilo (italic, etc.) viene del brief del cliente; si el brief no especifica, usar italic como default

### Body Text

```
text-sm leading-relaxed text-foreground/55
```

El `text-sm` (0.875rem) con `leading-relaxed` (1.625) da un body limpio que no compite con los headings. El `/55` de opacidad es clave — body a full opacity se siente denso.

### Labels / Metadata

```
text-xs text-foreground/40                                     (light sections)
text-[9px] font-semibold uppercase tracking-[0.15em] text-accent/80  (overlay labels)
text-[9px] uppercase tracking-widest text-foreground/30        (counter labels)
```

### Heading de Columna (Footer, grids informativos)

```
mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40
```

### Por que esta escala funciona

La clave no es "elegancia" — es **contraste deliberado**:
1. H1/H2 grandes con tracking negativo crean **anclas visuales** que guian el ojo
2. Body pequeno (text-sm) con opacidad baja (/55) **no compite** con los headings
3. Eyebrows en uppercase con tracking ultra-wide son **senales de seccion** que preparan al lector
4. La fuente display en subtitulos rompe la monotonia de una sola familia y agrega **caracter editorial**

Este sistema funciona igual con una sans-serif geometrica (como Plus Jakarta Sans) que con una humanista (como Inter) o una display bold (como Clash Display). Lo que importa es mantener las **relaciones entre niveles**, no las fuentes especificas.

---

## 10. Animation System — Framer Motion Blueprint

### Constante Global de Easing

```ts
const EASING = [0.22, 1, 0.36, 1] as const;
```

Este easing (`ease-premium` en Tailwind) se usa en **TODAS** las animaciones sin excepcion. Es un ease-out suave que desacelera lentamente — el movimiento se siente natural y refinado, no mecanico ni robotico.

### FadeIn (Scroll-triggered, componente reutilizable)

```ts
// components/motion/FadeIn.tsx
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

// direction offsets
const directionOffset = {
  up:    { x: 0, y: 20 },
  down:  { x: 0, y: -20 },
  left:  { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none:  { x: 0, y: 0 },
};

// variants
hidden: { opacity: 0, x, y }
visible: {
  opacity: 1, x: 0, y: 0,
  transition: {
    duration: 0.5,               // Duracion estandar — suficiente para notar sin aburrir
    delay: 0,                    // Configurable via prop
    ease: [0.22, 1, 0.36, 1],
  },
}
viewport: { once: true, margin: '-64px' }  // Trigger: 64px antes de entrar al viewport
```

**Uso en secciones:** Envolver el bloque de encabezado con `<FadeIn>`.

### FadeInStagger (Cards / listas con delay escalonado)

```ts
// components/motion/FadeInStagger.tsx
container: {
  hidden: {},
  visible: { transition: { staggerChildren: configurable } }
}
item: {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}
viewport: { once: true, margin: '-64px' }
```

**Stagger values recomendados:**
- Cards (3-4 items): `stagger={0.12}`
- Timeline / pasos (4+ items): `stagger={0.15}`
- Listas rapidas (6+ items): `stagger={0.08}`
- Default: `stagger={0.1}`

### Hero FadeUp (secuencia cinematica)

El Hero es la unica seccion que usa animaciones basadas en `animate` (no `whileInView`) porque es la primera vista — se ejecuta al cargar.

```ts
const useFadeUp = (reduced) => (delay = 0) => ({
  initial: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },  // y=28 mas dramatico que y=20
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: reduced ? 0.2 : 0.65,   // Mas lenta que secciones normales
    delay: reduced ? 0 : delay,
    ease: [0.22, 1, 0.36, 1],
  },
});
```

**Secuencia de delays del Hero (formula probada):**

| Elemento | Delay | Razon |
|----------|-------|-------|
| Eyebrow | `0` | Primer elemento visible — contexto inmediato |
| H1 | `0.1` | Titulo entra casi inmediato |
| Divider (scaleX) | `0.22` | Se "dibuja" despues del titulo — efecto de revelacion |
| Subtitle | `0.25` | Justo despues del divider |
| CTAs | `0.38` | Pausa deliberada antes de la accion — crea anticipacion |
| Stats/badges | `0.5` | Ultimo en aparecer — detalle que no roba atencion al CTA |

**Divider animation (Hero):**

```ts
initial: { scaleX: 0, originX: 0 }
animate: { scaleX: 1 }
transition: { duration: 0.6, delay: 0.22, ease: EASING }
```

La animacion de scaleX desde el origen izquierdo da un efecto de "linea que se dibuja" — sutil pero premium.

### RotatingWord / ProcessTitle

Para titulos con palabras que rotan (ej. "Transforma tu **sala** en 4 pasos"):

```ts
// AnimatePresence mode="wait"
initial: { opacity: 0, y: 10 }
animate: { opacity: 1, y: 0 }
exit:    { opacity: 0, y: -10 }
transition: { duration: 0.35, ease: EASING }

// Intervalo: 2500ms entre palabras
// Estilo de la palabra: font-display italic text-accent
```

Si las palabras tienen genero gramatical que afecta al prefijo (ej. "tu" vs "tus"), usar la variante ProcessTitle que acepta `WordEntry` con genero.

### Carousel Slide Transition

```ts
// AnimatePresence mode="wait"
initial: { opacity: 0, scale: 1.03 }     // Zoom-in sutil — da sensacion de profundidad
animate: { opacity: 1, scale: 1 }
exit:    { opacity: 0, scale: 0.98 }      // Zoom-out sutil
transition: { duration: 0.6, ease: EASING }
```

### Accordion (expand/collapse)

```ts
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
exit:    { height: 0, opacity: 0 }
transition: { duration: 0.38, ease: EASING }
```

### FAB (Floating Action Button) entrada

```ts
initial: { opacity: 0, scale: 0.6, y: 20 }
animate: { opacity: 1, scale: 1, y: 0 }
transition: { delay: 0.8, duration: 0.5, ease: EASING }
```

### Tooltip del FAB

```ts
initial: { opacity: 0, x: 8 }
animate: { opacity: 1, x: 0 }
exit:    { opacity: 0, x: 8 }
transition: { duration: 0.25, ease: EASING }
```

### CSS Transitions (Tailwind)

Para micro-interacciones que no requieren Framer Motion:

```
Botones:    transition-all duration-300 ease-premium
Colores:    transition-colors duration-200
Transforms: transition-transform duration-300 ease-premium
Overlay:    transition-transform duration-500 ease-premium (translate-y slide)
Opacity:    transition-opacity duration-700 ease-premium (media load)
Header:     transition-all duration-500 ease-premium (scroll state)
```

### Reduced Motion — Obligatorio

**Toda animacion debe respetar `prefers-reduced-motion`.**

```ts
const reduced = useReducedMotion(); // hook de Framer Motion

// Si reduced:
// - Omitir translate/scale, mantener solo opacity
// - Reducir duracion a 0.2s
// - Eliminar delays
// - Detener rotaciones de palabras (mostrar solo la primera)
```

CSS global en `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Component Patterns — Recetas Reutilizables

### Boton Primario (bg-primary)

```tsx
<Link
  href={href}
  className={cn(
    'inline-flex items-center gap-2.5',
    'rounded-xl bg-primary px-7 py-3.5',
    'text-sm font-semibold text-primary-foreground',
    'shadow-medium transition-all duration-300 ease-premium',
    'hover:bg-primary/90 hover:shadow-strong hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-soft',
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  )}
>
  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
  {label}
</Link>
```

**Lo que hace este boton premium:**
- `rounded-xl` (no rounded-md) — radio mas generoso se siente moderno
- `px-7 py-3.5` — padding generoso; un boton apretado se siente barato
- `shadow-medium` en reposo, `shadow-strong` en hover — profundidad progresiva
- `hover:-translate-y-0.5` — micro-elevacion de 2px que da vida sin ser agresivo
- `active:translate-y-0` — regresa al pulsar, feedback fisico inmediato

### Boton Accent (para CTAs secundarios / WhatsApp)

```tsx
className={cn(
  'inline-flex items-center gap-3',
  'rounded-xl bg-accent px-7 py-3.5',
  'font-sans text-sm font-semibold text-accent-foreground',
  'shadow-medium transition-all duration-300 ease-premium',
  'hover:brightness-105 hover:shadow-strong hover:-translate-y-0.5',
  'active:translate-y-0',
  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
)}
```

**Nota:** en fondos oscuros agregar `focus-visible:ring-offset-primary`.

### Boton Ghost / Link

```tsx
className={cn(
  'inline-flex items-center gap-1.5',
  'text-sm font-medium text-foreground/55',
  'transition-colors duration-200 hover:text-foreground',
  'group',
)}
// Arrow icon con:
// transition-transform duration-200 ease-premium group-hover:translate-x-1
```

### Card Interactiva

```tsx
<Link
  href={href}
  className={cn(
    'group flex h-full flex-col rounded-2xl bg-background p-7',
    'border border-border/60',
    'shadow-soft',
    'transition-all duration-300 ease-premium',
    'hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  )}
>
```

**Lo que hace esta card premium:**
- `p-7` — padding interno generoso (no p-4)
- `border border-border/60` — borde sutil, no ausente ni grueso
- `hover:-translate-y-1.5` — elevacion de 6px en hover, perceptible
- `hover:border-accent/35` — el borde cambia sutilmente a accent, no desaparece
- `h-full` — todas las cards del grid tienen la misma altura

**Icono dentro de card:**

```tsx
<div className={cn(
  'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl',
  'transition-transform duration-300 ease-premium group-hover:scale-110',
  iconBg,  // bg-orange-50, bg-primary/8, etc.
)}>
  <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" strokeWidth={1.75} />
</div>
```

`strokeWidth={1.75}` en iconos de lucide es el punto dulce — mas fino que el default (2) pero legible.

### Divider Accent

```
Centrado:      mx-auto mt-6 h-px w-12 bg-accent
Izquierda:     mt-6 h-px w-12 bg-accent
Sobre dark:    bg-accent/60
Inline sutil:  h-px w-8 bg-accent/60 (dentro de overlays)
```

### Grid Patterns

```
4 columnas:   grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6
2 columnas:   grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20
Footer grid:  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8
Timeline:     grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6
```

### Mobile Scroll Horizontal Pattern

Para contenido que es grid en desktop pero carrusel horizontal en mobile:

```tsx
<div className={cn(
  'flex gap-5 overflow-x-auto pb-4',
  'snap-x snap-mandatory',
  '-mx-6 px-6 lg:-mx-0 lg:px-0',         // Bleed: items desbordan el container en mobile
  'md:grid md:overflow-visible md:pb-0',   // Tablet+: grid normal
)}>
  <div className="snap-start shrink-0 w-[78vw] sm:w-[50vw] md:w-auto">
    {/* Card */}
  </div>
</div>
```

El bleed (`-mx-6 px-6`) es clave — permite que las cards se vean cortadas en el borde, indicando al usuario que puede deslizar.

### Overlay Slide-Up (hover en desktop, toggle en mobile)

```tsx
<div className={cn(
  'absolute inset-0 z-10',
  'bg-gradient-to-t from-black/95 via-black/80 to-black/30',
  'translate-y-full transition-transform duration-500 ease-premium',
  'group-hover:translate-y-0',
  infoOpen && 'translate-y-0',  // Mobile toggle
)}>
```

Siempre con boton de toggle visible en mobile (`md:opacity-0 md:group-hover:opacity-100`).

### Glassmorphism / Blur Cards (sobre fondos oscuros)

```tsx
className={cn(
  'rounded-2xl',
  'border border-white/10 bg-white/5 backdrop-blur-sm',
  'px-8 py-10',
)}
```

### Dots de Navegacion (carrusel)

```tsx
<button
  role="tab"
  type="button"
  aria-selected={i === current}
  className={cn(
    'h-1.5 rounded-full transition-all duration-400 ease-premium',
    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
    i === current
      ? 'w-8 bg-accent'        // Dot activo: alargado
      : 'w-2 bg-white/30 hover:bg-white/50',
  )}
/>
```

El dot activo alargado (`w-8` vs `w-2`) es un detalle premium que muchos sitios no tienen.

---

## 12. Data Architecture — Patron de Datos

### Patron de Array de Configuracion (pre-WP)

Antes de conectar WordPress, los datos viven en arrays tipados dentro de cada componente de seccion:

```ts
interface Step {
  number: 1 | 2 | 3 | 4;
  Icon: ComponentType<LucideProps>;
  titleKey: string;   // Clave de traduccion
  descKey: string;    // Clave de traduccion
}

const STEPS: Step[] = [
  { number: 1, Icon: WhatsAppIcon, titleKey: 'step_1_title', descKey: 'step_1_desc' },
  // ...
];
```

**Reglas:**
- Toda interfaz de datos se exporta para reutilizacion
- Los textos siempre son claves de traduccion, nunca strings directos
- Los icons vienen de `lucide-react` como `ComponentType<LucideProps>`
- Clases Tailwind en datos (iconBg, iconColor) son aceptables para variaciones visuales por item
- Usar `as const` o union types para valores finitos (ej. `number: 1 | 2 | 3 | 4`)

### Estructura de Messages (next-intl)

```json
{
  "namespace": {
    "eyebrow": "...",
    "title": "...",
    "subtitle": "...",
    "field_key": "..."
  }
}
```

**Convenciones:**
- Un namespace por seccion: `hero`, `problems`, `faq`, `process`, `reels`, `cta`, `footer`, `nav`
- Namespaces de componentes UI compartidos: `whatsapp`, `projectCard`, `solutions`, `products`
- Claves siempre en `snake_case`
- Preguntas FAQ numeradas: `q_1`, `a_1`, `q_2`, `a_2`...
- Pasos numerados: `step_1_title`, `step_1_desc`...

### Migracion a WordPress (Fase 3 → 4 de cada cliente)

Cada array de configuracion se reemplaza por un query GraphQL:

```ts
// ANTES (estatico):
const STEPS: Step[] = [ { number: 1, Icon: WhatsAppIcon, ... } ];

// DESPUES (dinamico):
// 1. CPT y meta fields creados en JetEngine (Fase 2 del cliente)
// 2. bridge-fields.json actualizado con los meta keys (espejo de wp-config.json.fields)
// 3. Query GraphQL en /lib/graphql/queries/getHome.graphql
// 4. npm run codegen → genera GetHomeDocument tipado
// 5. Fetcher en /lib/wordpress/getHome.ts (parsea repeaters JSON, valida con Zod)
// 6. Llamar desde el RSC: const home = await getHome(locale);
// 7. Mapear al componente: <ProcessSection steps={home.process.steps} />
```

**Reglas de migracion:**
- Los textos de UI puramente cosmeticos (eyebrow, CTA labels que no cambia el cliente) siguen en `next-intl`. Lo editorializable (titulos, subtitulos, copies de seccion) vive en WP via JetEngine
- Si esta en `wp-config.json.fields`, esta en WP. Si no, vive en `messages/{locale}.json`
- Cada fetcher en `/lib/wordpress/` devuelve tipos que coincidan con las props que el componente ya consumia — la migracion no debe forzar a cambiar el componente
- Fragments GraphQL se nombran por destino: `HomeHeroFragment`, `ProyectoCardFragment`, `ProcessStepsFragment`
- Los **repeaters** de JetEngine (`problems_cards`, `process_steps`, etc.) llegan como string JSON. El fetcher hace `JSON.parse` + valida con Zod y devuelve el objeto tipado al RSC

### GraphQL — Estructura de Queries

Los nombres de query y de tipo GraphQL los **deriva el plugin `cortinastudio-wpgraphql-bridge`** desde el slug del CPT en JetEngine (ver Seccion 14). Convencion validada:

| CPT slug en JetEngine | GraphQL plural (query) | GraphQL single (tipo) |
|---|---|---|
| `proyectos` | `proyectos { nodes }` | `Proyecto` |
| `home-singleton` | `homeSingletons { nodes }` | `HomeSingleton` |
| `faqs` | `faqs { nodes }` | `Faq` |
| `home` | `homes { nodes }` | `Home` |

Los meta fields se exponen camelCase: `hero_title` → `heroTitle`, `video_poster` → `videoPoster`.

```graphql
# lib/graphql/queries/getHome.graphql
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
      reelsSelected    # repeater → JSON string
    }
  }
}
```

**Reglas:**
- Un archivo `.graphql` por dominio (Home, Proyectos, General). No mezclar dominios
- Fragments nombrados por destino: `HomeHeroFragment`, `ProyectoCardFragment`
- Repeaters siempre se nombran exactamente como en `bridge-fields.json` (camelCase) y se documentan como "JSON string" en el comentario del query
- Para multi-idioma con WPML/Polylang: pasar `$language: LanguageCodeEnum!` cuando el plugin de i18n este activo. Si el cliente no usa multi-idioma en WP, el i18n vive solo en `messages/{locale}.json`

### Funcion de Fetch Tipada

```ts
// lib/wordpress/getHome.ts
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
  // ...
}

export async function getHome(): Promise<HomeData> {
  const data = await wpFetch<GetHomeQuery>(GetHomeDocument.toString(), undefined, {
    tags: [WP_TAGS.home],
  });

  const node = data.homeSingletons?.nodes?.[0];
  if (!node) throw new Error('Home singleton no encontrado en WP');

  return {
    hero: {
      eyebrow: node.heroEyebrow ?? '',
      title:   node.heroTitle   ?? '',
      subtitle:node.heroSubtitle ?? '',
      image:   node.heroImage   ?? null,
    },
    problems: {
      cards: problemCardsSchema.parse(JSON.parse(node.problemsCards ?? '[]')),
    },
    // ...
  };
}
```

**Reglas del fetcher:**
- Siempre `wpFetch` + tag de `WP_TAGS`. Nunca `fetch` directo
- Siempre Zod en frontera para repeaters (vienen como JSON string sin tipos)
- Devuelve el shape exacto que consume el componente; sin `null`s sueltos cuando hay defaults posibles

---

## 13. Internationalization (i18n) — Implementacion

### Configuracion Base

```ts
// i18n.ts — archivo raiz
import { getRequestConfig } from 'next-intl/server';
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'es';
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

// middleware.ts
export default createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',  // /es se omite, /en se muestra
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### Uso en Server Components (RSC)

```ts
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function MySection() {
  const t = await getTranslations('namespace');
  return <h2>{t('title')}</h2>;
}
```

### Uso en Client Components

```ts
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  return <h2>{t('title')}</h2>;
}
```

### En Layout (obligatorio)

```ts
// app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params: { locale } }) {
  setRequestLocale(locale);                    // Habilita SSG
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fontVar1} ${fontVar2}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

### En cada Page (obligatorio)

```ts
export default function MyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);  // OBLIGATORIO en cada page para SSG
  return <main>...</main>;
}
```

### Patron de Labels Delegadas

Cuando un componente `"use client"` necesita textos traducidos, el RSC padre los resuelve y los pasa como props:

```ts
// RSC padre (server)
const t = await getTranslations('projectCard');
const labels: ProjectCardLabels = {
  spaceLabel:   t('space_label'),
  problemLabel: t('problem_label'),
};
return <ReelCard reel={reel} labels={labels} />;

// Client component — recibe strings ya traducidos, nunca llama a useTranslations
export function ReelCard({ reel, labels }: ReelCardProps) { ... }
```

**Cuando usar este patron:** Cuando el client component es complejo (video player, carousel, accordion) y las traducciones son solo labels estaticos. Esto evita cargar el bundle de i18n en el cliente.

**Cuando NO usarlo:** Cuando el client component necesita traducciones dinamicas o interpolacion. En ese caso usar `useTranslations` directamente.

---

## 14. Integracion con WordPress — Stack Estandar Validado

Esta seccion describe **el stack WP exacto** que la fabrica usa. No es flexible: cada cliente nuevo debe quedar con esta misma configuracion para que el plugin propio, `wp-config.json`, los fetchers y el endpoint de revalidacion funcionen sin sorpresas.

### 14.1 Plugins requeridos en WP

| Plugin | Rol | Fuente |
|---|---|---|
| **WPGraphQL** | Capa GraphQL nativa | wordpress.org (gratis) |
| **JetEngine** | CPTs + meta fields (scalar y repeater) | Crocoblock (licencia) |
| **`cortinastudio-wpgraphql-bridge`** | Expone CPTs y meta de JetEngine a WPGraphQL sin tocar `functions.php` | Plugin propio en `wordpress/plugins/` de este repo |
| **Rank Math** | SEO con integracion GraphQL nativa | wordpress.org (gratis) |
| **WP Webhooks** (Cozmoslabs) | Webhook saliente al guardar posts | wordpress.org (gratis) |

**Plugins prohibidos (decisiones de fabrica):**
- `WPGraphQL SEO` (de Ash Hitchcock) — descontinuado.
- `Yoast SEO` — su integracion GraphQL solo esta en la version Premium.
- `Gato GraphQL` — no compatible con nuestro stack basado en `WPGraphQL` + `wpFetch`.
- `JetEngine WPGraphQL Integration` — no existe como modulo nativo en JetEngine 3.8+. El puente lo da nuestro plugin propio.

### 14.2 Plugin propio `cortinastudio-wpgraphql-bridge`

Vive en este repo en `wordpress/plugins/cortinastudio-wpgraphql-bridge/`. Se compone de **dos archivos**:

- `cortinastudio-wpgraphql-bridge.php` — el codigo PHP. **Nunca cambia entre clientes.**
- `bridge-fields.json` — la lista de meta fields a exponer. **Cambia por cliente** (mirror de `wp-config.json.fields`).

**Como funciona el plugin:**

1. **CPTs (Bloque 1, lista negra):** filtra `register_post_type_args`. Cualquier CPT que no este en la lista negra (`post`, `page`, `attachment`, internos de JetEngine/WPGraphQL/Yoast/RankMath) se expone automaticamente con `show_in_graphql = true`. No hace falta tocar functions.php por cada cliente.

2. **Naming GraphQL (regla de slug):** cuando los labels del CPT son ambiguos o iguales (caso comun en JetEngine), el plugin deriva los nombres GraphQL desde el slug:
   - Si el slug termina en `s` → `slug` es plural; `slug` sin la `s` final es singular.  
     `proyectos` → query `proyectos`, tipo `Proyecto`.
   - Si el slug NO termina en `s` → `slug` es singular; `slug + 's'` es plural.  
     `home-singleton` → query `homeSingletons`, tipo `HomeSingleton`.
   - kebab-case y snake_case se convierten automaticamente a camelCase.

3. **Meta fields (Bloque 2):** lee `bridge-fields.json` y registra cada meta key con `register_graphql_field` sobre el tipo correspondiente:
   - **`scalar`** → tipo GraphQL `String`. Resolver hace `get_post_meta(...)` y devuelve string o null.
   - **`repeater`** → tipo GraphQL `String`. Resolver devuelve `wp_json_encode(...)` del array. **El frontend hace `JSON.parse` y valida con Zod.**
   - Naming: `hero_title` → `heroTitle`, `video_poster` → `videoPoster`. Conversion automatica.

4. **Panel admin:** en `Settings → WPGraphQL Bridge` el plugin muestra el estado, escanea posts existentes y sugiere un template de `bridge-fields.json` listo para copiar. Esto acelera la replicacion por cliente.

**Estructura de `bridge-fields.json`:**

```json
{
  "<post_type_slug>": {
    "scalar":   ["meta_key_1", "meta_key_2", ...],
    "repeater": ["meta_key_repeater_1", ...]
  },
  ...
}
```

Ejemplo real (proyecto Cortina Studio):

```json
{
  "proyectos": {
    "scalar":   ["video", "video_poster", "platform", "space_type", "client_problem", "solution", ...],
    "repeater": []
  },
  "home-singleton": {
    "scalar":   ["hero_eyebrow", "hero_title", "hero_subtitle", ...],
    "repeater": ["problems_cards", "reels_selected", "process_rotating_words", "process_steps"]
  }
}
```

**Regla de oro:** lo que aparece como meta_key en `bridge-fields.json` debe aparecer (en camelCase) bajo `wp-config.json.fields.<cpt>.*`. Si no, el frontend pedira un campo que el backend no expone, o viceversa. Cuando se modifica uno, modificar el otro en el mismo PR.

### 14.3 Capa frontend `lib/wordpress/`

Estos archivos son **identicos en todos los clientes**. No los toques salvo evolucion deliberada de la base.

| Archivo | Rol |
|---|---|
| `config.ts` | Carga `wp-config.json` y lo valida con Zod. Expone `wpConfig` tipado. Falla temprano si el JSON esta mal |
| `client.ts` | Define `wpFetch<TData, TVariables>(query, variables, { tags, revalidate })` sobre `fetch` nativo de Next 14. Lanza `WordPressFetchError` con detalle |
| `tags.ts` | Constantes de tags de cache: `WP_TAGS.home = 'wp:home'`, `WP_TAGS.proyectos`, `WP_TAGS.general` |
| `index.ts` | Barrel export. Importar siempre `from '@/lib/wordpress'` |
| `README.md` | Playbook breve para el dev nuevo |

**`wp-config.json` (cambia por cliente):**

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

`endpoint` se sobreescribe en runtime con `process.env.NEXT_PUBLIC_WORDPRESS_API_URL` cuando exista, para que cada entorno (dev/staging/prod) apunte a un CMS distinto sin tocar el JSON.

### 14.4 Variables de entorno

`.env.example` (commiteado) define las claves; `.env.local` (NO commiteado) lleva los valores reales del cliente.

```
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.<dominio>/graphql
WORDPRESS_REVALIDATION_SECRET=<token-aleatorio-32+chars>
NEXT_PUBLIC_SITE_URL=https://<dominio>
WORDPRESS_PREVIEW_SECRET=<otro-token-aleatorio>
```

Generar secrets:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 14.5 Endpoint de revalidacion (`app/api/revalidate/route.ts`)

Estandar de fabrica: usa **`revalidateTag`**, no `revalidatePath`. Esto permite invalidar selectivamente por dominio (home, proyectos, general) sin tirar el cache entero.

```ts
// Llamada esperada desde WP Webhooks:
//   POST https://<dominio>/api/revalidate?secret=<SECRET>
//   Body: { "tag": "wp:home" }   ó   { "tags": ["wp:home", "wp:proyectos"] }
//   Body vacio → revalida todos los tags conocidos
```

Tags validos vienen de `lib/wordpress/tags.ts`. Si el body trae un tag desconocido se ignora silenciosamente y se devuelve en `ignored` para diagnostico.

### 14.6 Webhooks salientes en WordPress

Configurar en `WP Webhooks → Send Data`:

| Trigger | URL | Body |
|---|---|---|
| `post_saved` (CPT `home-singleton`) | `https://<dominio>/api/revalidate?secret=<SECRET>` | `{ "tag": "wp:home" }` |
| `post_saved` (CPT `proyectos`) | mismo URL | `{ "tag": "wp:proyectos" }` |
| Cambio en options "general" | mismo URL | `{ "tag": "wp:general" }` |

Method: `POST`, Body type: `JSON / Custom Payload`.

### 14.7 Codegen

Configurado en `codegen.ts` (raiz). El pipeline tiene dos pasos:

**Paso 1 — Descargar schema** (`scripts/fetch-schema.mjs`):
Hace introspeccion al endpoint de WordPress, stripea el BOM y guarda `lib/graphql/schema.json` localmente.

**Paso 2 — Generar tipos** (`graphql-codegen`):
Lee `lib/graphql/schema.json` y todos los `.graphql` bajo `lib/graphql/queries/`. Genera un unico archivo:

- `lib/graphql/generated/index.ts` — tipos del schema + `TypedDocumentNode` por cada query (todo junto)

Comandos:
```
npm run codegen        # fetch-schema + genera (el flujo normal)
npm run schema:fetch   # solo actualiza lib/graphql/schema.json (si el schema de WP cambio)
npm run codegen:watch  # observa cambios en los .graphql (usa el schema.json ya descargado)
```

**Cuando ejecutar:** despues de crear/editar cualquier `.graphql` o despues de cambios en el schema de WP (ej. nuevos meta fields en `bridge-fields.json`).

**Import correcto en fetchers:**
```ts
import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated';
```
No existe `@/lib/graphql/generated/operations` ni `@/lib/graphql/generated/types` — todo esta en `index.ts`.

#### Problemas conocidos (validados en Cortina Studio, 2026-04)

**BOM en respuesta del servidor WordPress**
Algunos servidores PHP (especialmente entornos staging con Traefik/Docker) devuelven un BOM (`﻿`) al inicio de las respuestas JSON. El `@graphql-tools/url-loader` de codegen falla con `Unexpected response` al intentar parsear ese JSON. **No se resuelve** con headers `Accept: application/json` ni `Content-Type`. La unica solucion estable es descargar el schema a un archivo local y que codegen lea el archivo: por eso existe `scripts/fetch-schema.mjs`.

**`.env.local` no se carga automaticamente en codegen**
`codegen.ts` se ejecuta con Node/jiti fuera del contexto de Next.js, por lo que `process.env` no incluye las variables de `.env.local`. `codegen.ts` lo parsea manualmente con `fs` en las primeras lineas. No instalar `dotenv` como dependencia — el parseo manual es suficiente y evita ruido en `package.json`.

**Preset `import-types` no instalado**
El preset `import-types` de `@graphql-codegen` requiere el paquete `@graphql-codegen/import-types-preset`, que no esta en el stack base y genera `Unable to find preset`. Solucion adoptada: un unico archivo de salida `lib/graphql/generated/index.ts` con los tres plugins fusionados (`typescript`, `typescript-operations`, `typed-document-node`). Es mas limpio y no requiere paquetes extra.

---

## 15. Accesibilidad — Reglas No Negociables

- HTML semantico obligatorio: `<section>`, `<nav>`, `<article>`, `<main>`, `<header>`, `<footer>`
- Todo `<section>` lleva `id` y `aria-labelledby` apuntando al `<h2>` con `id` correspondiente
- Focus visible en todo interactivo: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`
- `aria-hidden="true"` en iconos decorativos, dividers, y elementos visuales no informativos
- `aria-label` descriptivo en botones sin texto visible
- `aria-expanded` en toggles (accordion, mobile nav)
- `role="dialog"` con `aria-label` en overlays de informacion
- `role="tab"` / `role="tablist"` / `aria-selected` en dots de carrusel
- Botones siempre con `type="button"` (nunca depender del default `submit`)
- Alt text descriptivo en imagenes; `alt=""` solo si es puramente decorativa
- Contraste WCAG AA validado en todos los pares color/fondo
- `prefers-reduced-motion` respetado en CSS y Framer Motion

---

## 16. Performance Checklist

- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Imagenes con `next/image` siempre con `sizes` prop optimizado
- Fuentes con `next/font/google` + `display: 'swap'` + `variable`
- Videos con `preload="metadata"` + autoplay via IntersectionObserver (no autoplay al cargar)
- Lazy load por defecto; `priority` solo en imagen above-the-fold (Hero, primer slide)
- Componentes client lo mas pequenos posible; RSC para todo lo demas
- No `console.log` en produccion
- No dependencias innecesarias; verificar que shadcn/ui o el stack actual no resuelven antes de instalar

---

## 17. globals.css — Base CSS Obligatoria

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-background text-foreground font-sans;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  :focus-visible {
    @apply outline-2 outline-offset-2 outline-accent;
  }

  /* Scrollbar sutil */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { @apply bg-background; }
  ::-webkit-scrollbar-thumb { @apply bg-secondary rounded-full; }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

## 18. Flujo de Trabajo — Paso a Paso (cliente nuevo)

1. **Lee `client-brief.json`** para obtener paleta, tipografia y estructura del cliente.
2. **Configura `tailwind.config.ts`** con los tokens exactos del brief + tokens estandar (shadows, easing, radius).
3. **Configura `next-intl`** con locales `es` (default) y `en`. `messages/es.json` y `messages/en.json` arrancan vacios; se llenan a medida que se construyen secciones.
4. **Configura `globals.css`** con la base CSS de la seccion 17.
5. **Reusa `components/motion/FadeIn` y `FadeInStagger`** — son codigo de fabrica, no se reescriben por cliente.
6. **Layout principal primero:** Header + Footer + `app/[locale]/layout.tsx` con providers (NextIntlClientProvider, fonts via `next/font/google`).
7. **Edita `wp-config.json`** con: endpoint del CMS del cliente, slugs de CPT validados con JetEngine y nombres de meta fields. Edita `bridge-fields.json` (en el plugin) con los mismos meta keys (mirror obligatorio).
8. **PAUSA y espera aprobacion explicita** antes de continuar con secciones internas.
9. **Construye seccion por seccion** siguiendo el blueprint de la Seccion 8 — eyebrow + H2 + subtitle + divider. Datos primero como array tipado; cuando esten listos los queries GraphQL, swap a fetcher.
10. Antes de crear un componente nuevo, revisa si `components/ui/*` o `components/sections/*` ya tienen algo adaptable.
11. Cuando los queries esten listos: `npm run codegen`, crear fetchers en `lib/wordpress/getXxx.ts`, conectar al RSC.
12. Al terminar cada entregable: `npx tsc --noEmit` + `npm run lint` + sin `console.log` + sin codigo comentado muerto.

---

## 19. Lo que NO Debes Hacer

- Usar Pages Router
- Usar `any` en TypeScript
- Hardcodear colores, textos o URLs en JSX
- Hacer fetch dentro de componentes de UI
- Escribir queries GraphQL inline en componentes
- Usar `<img>`, `<a>` nativos cuando existen `next/image` y `next/link`
- Instalar librerias fuera del stack sin justificacion
- Continuar con paginas internas antes de aprobar el layout
- Generar codigo sin leer `client-brief.json` primero
- Animaciones exageradas, bouncy, o que ignoren `prefers-reduced-motion`
- Dos secciones consecutivas con el mismo fondo
- `font-display` sin el estilo que define el brief del cliente
- Valores hex arbitrarios cuando existe un token Tailwind
- Reducir paddings verticales de seccion por debajo de `py-24 lg:py-32` — el whitespace es el diseno
- Usar `rounded-md` o `rounded-sm` en botones principales — siempre `rounded-xl` o mayor
- Omitir el bloque de encabezado (eyebrow + H2 + subtitle + divider) en una seccion
- Botones con padding apretado (`px-4 py-2`) — siempre generosos (`px-7 py-3.5` o mas)

---

## 20. Comunicacion

- Responde en **espanol**
- Se directo y tecnico. Si una decision es mala, dilo y propone la alternativa
- Al terminar un entregable, resume en bullets que hiciste y que sigue
- Si necesitas una decision, pregunta con opciones concretas, no abiertas

---

## 21. Replicacion a un Cliente Nuevo — Contrato de Fabrica

Esta es la **promesa de la fabrica**: un cliente nuevo se levanta tocando 3 archivos de configuracion y dos opcionalmente. Todo lo demas se reusa intacto. Si te ves obligado a tocar codigo "estandar", PARA y plantea evolucionar la base — no parchees el cliente actual.

### 21.1 Archivos que cambian por cliente

| # | Archivo | Que llevar del cliente | Quien lo edita |
|---|---|---|---|
| 1 | `client-brief.json` | Paleta, tipografias, audiencia, estructura de paginas | Dev/Disenador (input creativo) |
| 2 | `wp-config.json` | `endpoint`, `siteUrl`, `cpt.*` (slug, single, plural, limit), `fields.*.{seccion}.{campo}` (meta keys), `iconMap` | Dev (Fase 1 del cliente) |
| 3 | `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` | Lista plana de meta keys por CPT (`scalar` y `repeater`) | Dev (Fase 2 del cliente) — debe espejar el #2 |
| 4 | `tailwind.config.ts` | `colors.*` y `fontFamily.*` derivados del brief; resto sin tocar | Dev (Fase 1) |
| 5 | `messages/{es,en}.json` | Eyebrows, labels, errores, microcopy de UI | Dev a medida que construye secciones |

### 21.2 Archivos que NO cambian (codigo de fabrica)

- `lib/wordpress/{config,client,tags,index}.ts` y `lib/wordpress/README.md`
- `app/api/revalidate/route.ts`
- `wordpress/plugins/cortinastudio-wpgraphql-bridge/cortinastudio-wpgraphql-bridge.php`
- `components/motion/FadeIn.tsx`, `components/motion/FadeInStagger.tsx`
- `app/globals.css` (la base CSS de la Seccion 17)
- `i18n/request.ts`, `middleware.ts`
- `codegen.ts`
- Reglas de diseno: paddings, easing, anatomia de seccion, jerarquia tipografica, opacidades estandar

Si necesitas cambiar algo de esta lista, **es una evolucion de la fabrica**, no del cliente. Discutela con el usuario, actualiza la base para todos los proyectos, y deja un commit explicito.

### 21.3 Checklist de levantamiento de un cliente nuevo

**Frontend (Fase 1 del cliente):**

- [ ] Clonar el repo base. Verificar que `lib/wordpress/`, `app/api/revalidate/`, `components/motion/`, `codegen.ts` esten intactos
- [ ] Reemplazar `client-brief.json` con el del nuevo cliente
- [ ] Mapear colores y tipografias del brief en `tailwind.config.ts`
- [ ] Cargar fuentes con `next/font/google` en `app/[locale]/layout.tsx`
- [ ] Editar `wp-config.json`: `endpoint`, `siteUrl`, `cpt.*`, `fields.*` placeholders (los meta keys finales se confirman tras crear los CPTs en WP)
- [ ] Crear `.env.local` con `NEXT_PUBLIC_WORDPRESS_API_URL`, `WORDPRESS_REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`
- [ ] `npx tsc --noEmit` sin errores nuevos

**Backend WordPress (Fase 2 del cliente):**

- [ ] WP nuevo con HTTPS y dominio propio (`cms.<dominio>`)
- [ ] Instalar y activar: WPGraphQL, JetEngine, Rank Math, WP Webhooks
- [ ] Subir el plugin `cortinastudio-wpgraphql-bridge` a `wp-content/plugins/`. Activarlo
- [ ] Crear los CPTs en JetEngine. Anotar los slugs reales (ej. `proyectos`, `home-singleton`)
- [ ] En cada CPT crear los meta fields (scalar y repeater). Anotar los meta keys
- [ ] Editar `bridge-fields.json` del plugin con los meta keys exactos. Subir el archivo actualizado al servidor (FTP/SSH/UI del plugin)
- [ ] Verificar en `Settings → WPGraphQL Bridge` que los CPTs aparezcan como "Expuesto" y los fields como configurados
- [ ] Validar en GraphiQL IDE que los queries devuelvan datos:
  ```graphql
  { proyectos { nodes { id title video } } }
  { homeSingletons { nodes { id heroTitle } } }
  ```
- [ ] Configurar webhooks en `WP Webhooks → Send Data` segun la tabla de Seccion 14.6
- [ ] Sincronizar `wp-config.json` del frontend con los nombres reales validados

**Conexion (Fase 3 del cliente):**

- [ ] Escribir queries `.graphql` en `lib/graphql/queries/` (una por dominio)
- [ ] `npm run codegen` para generar tipos
- [ ] Crear fetchers `lib/wordpress/getHome.ts`, `lib/wordpress/getProyectos.ts`, etc. — cada uno con `wpFetch` + tag de `WP_TAGS` + Zod en repeaters
- [ ] Reemplazar arrays estaticos en `components/sections/*` por props que vengan del fetcher

**Validacion final del cliente:**

- [ ] `npx tsc --noEmit` + `npm run lint` + `npm run build` pasan
- [ ] Editar un post en WP → POST llega a `/api/revalidate` → la pagina se actualiza dentro de los siguientes segundos sin redeploy
- [ ] Lighthouse / Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Apendice A (calidad premium) cumplido en cada seccion

### 21.4 Reglas de oro de la fabrica

1. **Mirror obligatorio:** todo meta_key que aparece en `bridge-fields.json` aparece (camelCase) en `wp-config.json.fields.<cpt>.*`. Cuando cambia uno, cambia el otro en el mismo PR.
2. **Repeater = JSON string:** los repeaters de JetEngine llegan como string. Validar con Zod en el fetcher antes de devolver al RSC. Nunca pasar el JSON sin parsear al componente.
3. **Naming GraphQL lo decide el plugin, no tu:** verifica los nombres reales en GraphiQL antes de escribir queries. Slug en `s` → singular = slug sin la s. Slug sin `s` → plural = slug + s.
4. **Tags antes que paths:** revalidacion siempre por `revalidateTag`, nunca por `revalidatePath`.
5. **Endpoint por entorno:** `NEXT_PUBLIC_WORDPRESS_API_URL` siempre gana sobre `wp-config.json.endpoint`. Asi mismo codigo apunta a CMS distintos en dev/staging/prod.
6. **Plugin PHP es inmutable por cliente:** si necesita una mejora, sube version (`CSB_VERSION`) y aplicala a todos los clientes en el siguiente roll.
7. **Sin Apollo, sin REST, sin functions.php:** el stack es `wpFetch` + `graphql-request` + plugin propio. Cualquier desviacion va contra la promesa de la fabrica.

---

## Apendice A: Checklist Rapido de Calidad Premium

Antes de entregar cualquier seccion o pagina, validar:

- [ ] Container usa `mx-auto max-w-7xl px-6 lg:px-8`
- [ ] Padding vertical es `py-24 lg:py-32` (minimo)
- [ ] Encabezado tiene: eyebrow + H2 + subtitle + divider
- [ ] H2 usa `text-balance tracking-tight`
- [ ] Eyebrow usa `tracking-[0.18em] text-accent uppercase`
- [ ] Subtitle usa `font-display` con estilo del brief
- [ ] Botones tienen `rounded-xl`, padding generoso, shadow-medium, hover:-translate-y
- [ ] Cards tienen border sutil, shadow-soft, hover con elevacion
- [ ] Todas las animaciones usan EASING `[0.22, 1, 0.36, 1]`
- [ ] FadeIn con `viewport={{ once: true, margin: '-64px' }}`
- [ ] Reducid motion respetado
- [ ] `aria-labelledby` en sections, `aria-hidden` en decorativos
- [ ] Focus visible en todo interactivo
- [ ] Fondo alterna entre secciones (nunca 2 iguales seguidas)
- [ ] No hay hex hardcodeados — todo via tokens
- [ ] Textos via `next-intl`, no hardcodeados
