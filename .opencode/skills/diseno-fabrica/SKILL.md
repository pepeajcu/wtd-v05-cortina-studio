---
name: diseno-fabrica
description: Reglas de diseno premium UNIVERSALES de la fabrica — design tokens, layout patterns, anatomia de seccion, jerarquia tipografica, sistema de animacion (Framer Motion), recetas de componentes, accesibilidad, globals.css y checklist final. Cargar SIEMPRE que la tarea toque UI, estilos, secciones, componentes visuales o animaciones. Esta skill exige consultar `.claude/skills/taste-design/` antes de proponer cualquier UI nueva.
---

# Diseno de la Fabrica — Sistema Premium Estandar

Manual de diseno **agnostico al cliente**. Define *como* construir UI premium consistente, no *que* colores ni *que* fuentes (eso lo decide `client-brief.json`).

> ⚠️ **REGLA OBLIGATORIA — Lee `taste-design/` antes de disenar**
>
> Antes de proponer cualquier UI, token, paleta, hero, seccion o componente nuevo, **DEBES** consultar las skills de referencia visual ubicadas en `.claude/skills/taste-design/`:
>
> - `design-taste-frontend/` — guia general de gusto frontend.
> - `high-end-visual-design/` — referencias visuales de gama alta.
> - `minimalist-ui/` — patrones minimalistas.
> - `industrial-brutalist-ui/` — patrones brutalistas.
> - `redesign-existing-projects/` — guia de rediseno.
> - `stitch-design-taste/` — gusto Stitch.
> - `full-output-enforcement/` — reglas de enforcement de output.
>
> **Las reglas de esta skill son el suelo (consistencia mecanica). `taste-design/` es el techo (criterio estetico).** Sin lo segundo, lo primero produce sitios consistentes pero genericos. Aplica primero el criterio de gusto, luego ajusta a las reglas mecanicas de aqui.

---

## 1. Design Tokens — Tailwind Config desde `client-brief.json`

### Como mapear el brief del cliente

`client-brief.json` provee colores y tipografias. `tailwind.config.ts` los consume como tokens semanticos. **NUNCA** se usan colores hex ni familias de fuente directamente en JSX.

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
        sans:    ['var(--font-heading)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
};
```

**Regla de colores:** Siempre definir el par `DEFAULT` + `foreground` para que `bg-primary text-primary-foreground` funcione sin pensar. Si el brief solo da 3 colores, derivar `muted` y `border` del secondary.

**Regla de fuentes:** Siempre dos familias — `font-sans` para headings + body, `font-display` para subtitulos decorativos. Si el brief solo da una fuente, usar la misma para ambas y ajustar el peso.

### Opacidades Estandar para Texto

Independientes del cliente — definen la jerarquia visual.

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

### Tokens de UI Estandar (siempre en `tailwind.config.ts`)

NO cambian entre clientes — son la base del sistema premium:

```ts
// Sombras — progresion sutil
boxShadow: {
  'soft':   '0 2px 8px 0 rgb(0 0 0 / 0.06)',
  'medium': '0 4px 16px 0 rgb(0 0 0 / 0.08)',
  'strong': '0 8px 32px 0 rgb(0 0 0 / 0.12)',
},

// Timing — suavidad premium
transitionTimingFunction: {
  'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
},

// Border radius
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

### Font Sizes — Escala Premium

**Tokens opcionales de display:**

```ts
fontSize: {
  'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
  'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.015em' }],
},
```

**Principios de escala:**

| Principio | Regla | Razon |
|-----------|-------|-------|
| Tracking negativo en headings grandes | `tracking-tight` en `text-3xl+` | Letras grandes con tracking normal se ven dispersas |
| Line-height ajustado al tamano | `leading-[1.1]` H1, `leading-tight` H2, `leading-relaxed` body | Headings con line-height de body se ven sueltos |
| Contraste de peso | Headings `font-semibold`/`font-bold`, body regular | La diferencia de peso crea jerarquia sin tamano excesivo |
| `text-balance` en headings | Siempre en H1 y H2 | Evita lineas huerfanas |
| Responsive con saltos dramaticos | Base `text-3xl`, desktop `text-4xl+` | En mobile se comprimen; en desktop deben respirar |

**Regla de `font-display`:** Si la fuente decorativa del brief es serif o script, **siempre llevar el estilo que defina el brief** (generalmente italic). Nunca mezclar estilos. Si el brief dice italic, toda instancia de `font-display` lleva `italic`.

---

## 2. Layout Patterns

### Container Global

```
mx-auto max-w-7xl px-6 lg:px-8
```

- Ancho maximo: `max-w-7xl` (80rem = 1280px).
- Padding horizontal: `px-6` (1.5rem) → `lg:px-8` (2rem).
- Centrado: `mx-auto`.
- Se repite en **TODAS** las secciones, Header y Footer.

### Header

```
<header fixed inset-x-0 top-0 z-50>
  <div mx-auto max-w-7xl px-6 lg:px-8>
    <div flex h-20 items-center justify-between gap-8>
      Logo | Nav | CTA
```

**Constantes:**
- Altura: `h-20` (5rem = 80px) — constante, no cambia con scroll.
- Posicion: `fixed inset-x-0 top-0 z-50`.
- z-index: 50 header, 20 overlays internos, 50 FABs.

**Scroll behavior (obligatorio):**
- Sin scroll: `bg-transparent`.
- Con scroll (>20px): `bg-background/95 backdrop-blur-md shadow-soft border-b border-border/40`.
- Transicion: `transition-all duration-500 ease-premium`.

```ts
const [isScrolled, setIsScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Logo:** `font-sans text-xl font-semibold tracking-tight text-foreground` con `<span className="text-accent">` para el acento de marca. Si el brief incluye logotipo, usar `next/image`.

**Nav links (desktop):** `text-sm font-medium text-foreground/65 hover:text-foreground` con underline accent expandible:

```tsx
<span aria-hidden="true"
  className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-full" />
```

**CTA desktop:** `rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft` con `hover:bg-primary/90 hover:shadow-medium hover:-translate-y-0.5`.

**Mobile nav:**
- Toggle con Menu/X icons de lucide-react.
- Panel con `border-t border-border bg-background`.
- Links con `py-2.5 text-sm font-medium text-foreground/70`.
- CTA mobile separado por `border-t border-border/50` con padding superior.
- Siempre `aria-expanded`, `aria-controls`, `aria-label` en el toggle.

### Footer

3 zonas verticales separadas por borders:

```
<footer bg-primary text-primary-foreground>
  1. CTA Strip:   border-b border-white/10 → py-14 → flex col→row + CTA button
  2. Main Grid:   py-16 → grid 1→2→4 cols → columnas de contenido
  3. Bottom Bar:  border-t border-accent/20 → py-6 → copyright + links legales
```

**CTA Strip:**
- `flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`.
- Copy side: `max-w-lg`.
- Boton CTA debe ser `bg-accent` (no primary, ya que el fondo ya es primary).

**Heading de columna:** `mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40`.

**Links de columna:** `text-sm text-primary-foreground/65 hover:text-accent` con animacion expandible:

```tsx
<span aria-hidden="true"
  className="block h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-3" />
```

**Social icons:** `h-9 w-9 rounded-lg border border-white/15 bg-white/5` hover: `border-accent/40 bg-accent/10 text-accent`.

**Bottom bar:**
- Linea accent decorativa: `h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent`.
- Copyright: `text-xs text-primary-foreground/35`.
- Links legales: `text-xs text-primary-foreground/35 underline-offset-4 hover:text-primary-foreground/70 hover:underline`.

### Narrower Containers (dentro de `max-w-7xl`)

| Ancho | Uso tipico |
|-------|------------|
| `max-w-2xl` + `text-center` | Encabezados de seccion centrados |
| `max-w-3xl` + `text-center` | CTA section |
| `max-w-xl` + `text-center` | Cards CTA destacadas, overlays |
| `max-w-lg` | Bloques de copy en footer, textos laterales |

---

## 3. Section Patterns — Blueprint Universal

### Anatomia Universal

```tsx
<section
  id="seccion-slug"
  aria-labelledby="seccion-slug-heading"
  className="bg-{variant} py-24 lg:py-32"
>
  <div className="mx-auto max-w-7xl px-6 lg:px-8">

    {/* -- Bloque de encabezado -- */}
    <FadeIn className="mx-auto max-w-2xl text-center">
      {/* 1. Eyebrow */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {t('eyebrow')}
      </p>

      {/* 2. Titulo H2 */}
      <h2 id="seccion-slug-heading"
        className={cn(
          'font-sans font-semibold text-{variant-text} text-balance',
          'text-3xl leading-tight tracking-tight',
          'lg:text-4xl',
        )}
      >
        {t('title')}
      </h2>

      {/* 3. Subtitulo */}
      <p className="mt-4 font-display text-base italic leading-relaxed text-{variant-text}/55 lg:text-lg">
        {t('subtitle')}
      </p>

      {/* 4. Divider accent */}
      <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-accent" />
    </FadeIn>

    {/* -- Contenido principal — mt-14 desde el heading -- */}
    <div className="mt-14">
      {/* Grid, cards, carousel, timeline, etc. */}
    </div>

  </div>
</section>
```

### Por que cada parte importa

| Elemento | Proposito |
|----------|-----------|
| Eyebrow | Contextualiza la seccion. Rompe la monotonia de H2 tras H2 |
| H2 semibold | Titulo con peso visual, tracking tight, texto balanceado |
| Subtitle italic | Suaviza el tono, agrega matiz editorial. Siempre `font-display` |
| Divider accent | Separador visual sutil que cierra el bloque de encabezado |

### Variantes de Fondo

| Variante | Background | Texto principal | Texto muted | Divider |
|----------|-----------|----------------|-------------|---------|
| Light | `bg-background` | `text-foreground` | `text-foreground/55` | `bg-accent` |
| Soft | `bg-secondary/20` | `text-foreground` | `text-foreground/55` | `bg-accent` |
| Dark | `bg-primary` | `text-primary-foreground` | `text-primary-foreground/55` | `bg-accent/60` |

### Paddings Verticales

| Tipo | Clase | Uso |
|------|-------|-----|
| Estandar | `py-24 lg:py-32` | Secciones normales |
| Enfatizado | `py-32 lg:py-44` | CTA final, hero de conversion |
| Footer CTA strip | `py-14` | Zona CTA del footer |
| Footer main | `py-16` | Grid principal del footer |
| Footer bottom | `py-6` | Copyright bar |

**REGLA CRITICA:** El whitespace ES el diseno premium. NUNCA reducir paddings para "ahorrar espacio".

### Ritmo Visual de Backgrounds

Nunca dos secciones consecutivas con el mismo fondo. Ejemplo de alternancia:

```
A → bg-background    (light)
B → bg-secondary/20  (soft)
C → bg-primary       (dark)
D → bg-background    (light)
E → bg-primary       (dark)
CTA → bg-secondary/90  (overlay sobre imagen)
Footer → bg-primary   (dark, siempre)
```

---

## 4. Typography Patterns — Jerarquia Exacta

### H1 (solo una vez por pagina, tipicamente Hero)
```
font-sans font-semibold text-foreground text-balance
text-4xl leading-[1.1] tracking-tight
lg:text-5xl xl:text-[3.25rem]
```

### H2 — Estandar
```
font-sans font-semibold text-{variant-text} text-balance
text-3xl leading-tight tracking-tight
lg:text-4xl
```

### H2 — Enfatizado
```
font-sans font-bold text-foreground text-balance
text-4xl leading-[1.15] tracking-tight
lg:text-5xl xl:text-[3.5rem]
```

### H3 (cards, pasos, items)
```
font-sans text-base font-semibold leading-snug text-foreground
```

### Eyebrow
```
Estandar:    text-xs font-semibold uppercase tracking-[0.18em] text-accent
Enfatizado:  text-[11px] font-semibold uppercase tracking-[0.22em] text-accent
```
- `mb-3` antes de un H2.
- `mb-5` antes de un H1.

### Subtitle (font-display)
```
font-display text-base italic leading-relaxed text-{variant-text}/55 lg:text-lg
```
- Siempre despues de `mt-4` desde el H2.
- Opacidad reducida `/55` para contraste con el H2.
- El estilo (italic, etc.) viene del brief; default italic si el brief no especifica.

### Body Text
```
text-sm leading-relaxed text-foreground/55
```

### Labels / Metadata
```
text-xs text-foreground/40                                              (light)
text-[9px] font-semibold uppercase tracking-[0.15em] text-accent/80     (overlay)
text-[9px] uppercase tracking-widest text-foreground/30                 (counter)
```

### Heading de Columna (Footer, grids)
```
mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40
```

---

## 5. Animation System — Framer Motion Blueprint

### Easing Global

```ts
const EASING = [0.22, 1, 0.36, 1] as const;
```

`ease-premium` en Tailwind. Se usa en **TODAS** las animaciones sin excepcion.

### FadeIn (scroll-triggered, reutilizable)

```ts
// components/motion/FadeIn.tsx
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const directionOffset = {
  up:    { x: 0, y: 20 },
  down:  { x: 0, y: -20 },
  left:  { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none:  { x: 0, y: 0 },
};

hidden:  { opacity: 0, x, y }
visible: {
  opacity: 1, x: 0, y: 0,
  transition: { duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }
}
viewport: { once: true, margin: '-64px' }
```

### FadeInStagger (cards, listas)

```ts
container: { hidden: {}, visible: { transition: { staggerChildren: configurable } } }
item: {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}
viewport: { once: true, margin: '-64px' }
```

**Stagger values:**
- Cards (3-4): `0.12`
- Timeline / pasos (4+): `0.15`
- Listas rapidas (6+): `0.08`
- Default: `0.1`

### Hero FadeUp (secuencia cinematica)

```ts
const useFadeUp = (reduced) => (delay = 0) => ({
  initial: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: reduced ? 0.2 : 0.65,
    delay: reduced ? 0 : delay,
    ease: [0.22, 1, 0.36, 1],
  },
});
```

**Secuencia de delays del Hero:**

| Elemento | Delay |
|----------|-------|
| Eyebrow | `0` |
| H1 | `0.1` |
| Divider (scaleX) | `0.22` |
| Subtitle | `0.25` |
| CTAs | `0.38` |
| Stats/badges | `0.5` |

**Divider del Hero:**
```ts
initial: { scaleX: 0, originX: 0 }
animate: { scaleX: 1 }
transition: { duration: 0.6, delay: 0.22, ease: EASING }
```

### RotatingWord / ProcessTitle

```ts
// AnimatePresence mode="wait"
initial: { opacity: 0, y: 10 }
animate: { opacity: 1, y: 0 }
exit:    { opacity: 0, y: -10 }
transition: { duration: 0.35, ease: EASING }

// Intervalo: 2500ms entre palabras
// Estilo de la palabra: font-display italic text-accent
```

### Carousel Slide
```ts
initial: { opacity: 0, scale: 1.03 }
animate: { opacity: 1, scale: 1 }
exit:    { opacity: 0, scale: 0.98 }
transition: { duration: 0.6, ease: EASING }
```

### Accordion
```ts
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
exit:    { height: 0, opacity: 0 }
transition: { duration: 0.38, ease: EASING }
```

### FAB entrada
```ts
initial: { opacity: 0, scale: 0.6, y: 20 }
animate: { opacity: 1, scale: 1, y: 0 }
transition: { delay: 0.8, duration: 0.5, ease: EASING }
```

### Tooltip FAB
```ts
initial: { opacity: 0, x: 8 }
animate: { opacity: 1, x: 0 }
exit:    { opacity: 0, x: 8 }
transition: { duration: 0.25, ease: EASING }
```

### CSS Transitions (Tailwind, micro-interacciones)
```
Botones:    transition-all duration-300 ease-premium
Colores:    transition-colors duration-200
Transforms: transition-transform duration-300 ease-premium
Overlay:    transition-transform duration-500 ease-premium
Opacity:    transition-opacity duration-700 ease-premium
Header:     transition-all duration-500 ease-premium
```

### Reduced Motion — Obligatorio

```ts
const reduced = useReducedMotion();

// Si reduced:
// - Omitir translate/scale, mantener solo opacity
// - Reducir duracion a 0.2s
// - Eliminar delays
// - Detener rotaciones de palabras (mostrar solo la primera)
```

---

## 6. Component Patterns — Recetas Reutilizables

### Boton Primario (`bg-primary`)

```tsx
<Link href={href}
  className={cn(
    'inline-flex items-center gap-2.5',
    'rounded-xl bg-primary px-7 py-3.5',
    'text-sm font-semibold text-primary-foreground',
    'shadow-medium transition-all duration-300 ease-premium',
    'hover:bg-primary/90 hover:shadow-strong hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-soft',
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  )}>
  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
  {label}
</Link>
```

Por que es premium:
- `rounded-xl` no `rounded-md`.
- `px-7 py-3.5` padding generoso.
- `shadow-medium`/`shadow-strong` progresion de profundidad.
- `hover:-translate-y-0.5` micro-elevacion.
- `active:translate-y-0` feedback fisico.

### Boton Accent (CTAs secundarios / WhatsApp)

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
En fondos oscuros agregar `focus-visible:ring-offset-primary`.

### Boton Ghost / Link

```tsx
className={cn(
  'inline-flex items-center gap-1.5',
  'text-sm font-medium text-foreground/55',
  'transition-colors duration-200 hover:text-foreground',
  'group',
)}
// Arrow icon: transition-transform duration-200 ease-premium group-hover:translate-x-1
```

### Card Interactiva

```tsx
<Link href={href}
  className={cn(
    'group flex h-full flex-col rounded-2xl bg-background p-7',
    'border border-border/60',
    'shadow-soft',
    'transition-all duration-300 ease-premium',
    'hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  )}>
```

**Icono dentro de card:**

```tsx
<div className={cn(
  'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl',
  'transition-transform duration-300 ease-premium group-hover:scale-110',
  iconBg,
)}>
  <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" strokeWidth={1.75} />
</div>
```

`strokeWidth={1.75}` es el punto dulce — mas fino que el default (2) pero legible.

### Divider Accent

```
Centrado:      mx-auto mt-6 h-px w-12 bg-accent
Izquierda:     mt-6 h-px w-12 bg-accent
Sobre dark:    bg-accent/60
Inline sutil:  h-px w-8 bg-accent/60
```

### Grid Patterns

```
4 cols:  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6
2 cols:  grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20
Footer:  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8
Timeline: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6
```

### Mobile Scroll Horizontal Pattern

```tsx
<div className={cn(
  'flex gap-5 overflow-x-auto pb-4',
  'snap-x snap-mandatory',
  '-mx-6 px-6 lg:-mx-0 lg:px-0',
  'md:grid md:overflow-visible md:pb-0',
)}>
  <div className="snap-start shrink-0 w-[78vw] sm:w-[50vw] md:w-auto">
    {/* Card */}
  </div>
</div>
```

El bleed (`-mx-6 px-6`) permite que las cards se vean cortadas en el borde, indicando deslizar.

### Overlay Slide-Up

```tsx
<div className={cn(
  'absolute inset-0 z-10',
  'bg-gradient-to-t from-black/95 via-black/80 to-black/30',
  'translate-y-full transition-transform duration-500 ease-premium',
  'group-hover:translate-y-0',
  infoOpen && 'translate-y-0',
)}>
```

Siempre con boton de toggle visible en mobile (`md:opacity-0 md:group-hover:opacity-100`).

### Glassmorphism (sobre fondos oscuros)

```tsx
className={cn(
  'rounded-2xl',
  'border border-white/10 bg-white/5 backdrop-blur-sm',
  'px-8 py-10',
)}
```

### Dots de Navegacion (carrusel)

```tsx
<button role="tab" type="button"
  aria-selected={i === current}
  className={cn(
    'h-1.5 rounded-full transition-all duration-400 ease-premium',
    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
    i === current
      ? 'w-8 bg-accent'
      : 'w-2 bg-white/30 hover:bg-white/50',
  )} />
```

---

## 7. Accesibilidad — Reglas No Negociables

- HTML semantico obligatorio: `<section>`, `<nav>`, `<article>`, `<main>`, `<header>`, `<footer>`.
- Todo `<section>` lleva `id` y `aria-labelledby` apuntando al `<h2>` con `id` correspondiente.
- Focus visible en todo interactivo: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`.
- `aria-hidden="true"` en iconos decorativos, dividers, elementos visuales no informativos.
- `aria-label` descriptivo en botones sin texto visible.
- `aria-expanded` en toggles (accordion, mobile nav).
- `role="dialog"` con `aria-label` en overlays de informacion.
- `role="tab"` / `role="tablist"` / `aria-selected` en dots de carrusel.
- Botones siempre con `type="button"` (nunca depender del default `submit`).
- Alt text descriptivo en imagenes; `alt=""` solo si es puramente decorativa.
- Contraste WCAG AA validado en todos los pares color/fondo.
- `prefers-reduced-motion` respetado en CSS y Framer Motion.

---

## 8. `globals.css` — Base CSS Obligatoria

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

## 9. Lo que NO debes hacer

- Hardcodear colores, textos o URLs en JSX.
- Animaciones exageradas, bouncy, o que ignoren `prefers-reduced-motion`.
- Dos secciones consecutivas con el mismo fondo.
- `font-display` sin el estilo que define el brief del cliente.
- Valores hex arbitrarios cuando existe un token Tailwind.
- Reducir paddings verticales por debajo de `py-24 lg:py-32` — el whitespace es el diseno.
- Usar `rounded-md` o `rounded-sm` en botones principales — siempre `rounded-xl` o mayor.
- Omitir el bloque de encabezado (eyebrow + H2 + subtitle + divider) en una seccion.
- Botones con padding apretado (`px-4 py-2`) — siempre generosos (`px-7 py-3.5` o mas).
- Proponer UI sin haber leido `.claude/skills/taste-design/` primero.

---

## Apendice A: Checklist Rapido de Calidad Premium

Antes de entregar cualquier seccion o pagina, validar:

- [ ] Container usa `mx-auto max-w-7xl px-6 lg:px-8`.
- [ ] Padding vertical es `py-24 lg:py-32` (minimo).
- [ ] Encabezado tiene: eyebrow + H2 + subtitle + divider.
- [ ] H2 usa `text-balance tracking-tight`.
- [ ] Eyebrow usa `tracking-[0.18em] text-accent uppercase`.
- [ ] Subtitle usa `font-display` con estilo del brief.
- [ ] Botones tienen `rounded-xl`, padding generoso, shadow-medium, hover:-translate-y.
- [ ] Cards tienen border sutil, shadow-soft, hover con elevacion.
- [ ] Todas las animaciones usan EASING `[0.22, 1, 0.36, 1]`.
- [ ] FadeIn con `viewport={{ once: true, margin: '-64px' }}`.
- [ ] Reduced motion respetado.
- [ ] `aria-labelledby` en sections, `aria-hidden` en decorativos.
- [ ] Focus visible en todo interactivo.
- [ ] Fondo alterna entre secciones (nunca 2 iguales seguidas).
- [ ] No hay hex hardcodeados — todo via tokens.
- [ ] Textos via `next-intl`, no hardcodeados.
- [ ] Antes de proponer UI nueva, consultaste `.claude/skills/taste-design/`.
