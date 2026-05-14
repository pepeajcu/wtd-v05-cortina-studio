---
name: diseno-fabrica
description: Contrato del motor — tokens del brief, container, accesibilidad, globals.css y regla brief-wins-over-family. Selecciona UNA skill de familia estetica segun `design_system.vibe` del brief y carga el preset de motion segun `design_system.motion`. Cargar SIEMPRE que la tarea toque UI, estilos, secciones, componentes visuales o animaciones.
---

# Diseno de la Fabrica — Contrato del Motor

`diseno-fabrica` es el **contrato delgado** del motor. Define invariantes (tokens del brief, container, accesibilidad, base CSS) y **delega** TODA decision de layout, anatomia de seccion, recetas de componentes, tipografia (escala/peso/tracking), motion y composicion en las skills de `.claude/skills/taste-design/`, seleccionadas via los campos `design_system.vibe` y `design_system.motion` del brief.

> **Cambio de modelo:** esta skill ya NO contiene patrones de Header, Footer, anatomia de seccion, recetas de boton/card, ni jerarquia tipografica detallada. Esos puntos los decide la **familia** (`high-end-visual-design` | `minimalist-ui` | `industrial-brutalist-ui`) seleccionada por el brief. Lo que aqui queda son las "leyes de la fisica" del motor: tokens, container, a11y, semantica, motion-calm-preset y la regla de precedencia.

---

## 1. Lectura obligatoria de `client-brief.json`

Antes de generar UI, leer `client-brief.json` y extraer:

- `design_system.colors.*` → tokens Tailwind (seccion 3).
- `design_system.typography.*` → familias y pesos en Tailwind (seccion 3).
- `design_system.vibe` → enum cerrado, selecciona familia (seccion 4).
- `design_system.motion` → enum cerrado, selecciona preset de motion (seccion 5).

Si faltan `vibe` o `motion`, **PARA y pide al usuario completarlos**. No adivines.

---

## 2. Container y semantica HTML (no negociable)

- Container global: `mx-auto max-w-7xl px-6 lg:px-8`. Se repite en **TODAS** las secciones, Header y Footer. La familia NO puede sustituir este valor.
- Cada `<section>` lleva `id` y `aria-labelledby` apuntando al `<h2>` con `id` correspondiente.
- HTML semantico obligatorio: `<section>`, `<nav>`, `<article>`, `<main>`, `<header>`, `<footer>`.

---

## 3. Mapeo brief → tokens Tailwind

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

### Opacidades semanticas de texto (no negociable)

Independientes del cliente — definen la jerarquia visual y son consumibles por cualquier familia:

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

### Tokens de UI estandar

Definidos siempre en `tailwind.config.ts`. La familia puede **extender** pero no eliminar:

```ts
boxShadow: {
  'soft':   '0 2px 8px 0 rgb(0 0 0 / 0.06)',
  'medium': '0 4px 16px 0 rgb(0 0 0 / 0.08)',
  'strong': '0 8px 32px 0 rgb(0 0 0 / 0.12)',
},

transitionTimingFunction: {
  'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
},

borderRadius: {
  DEFAULT: '0.375rem',
  'xl': '0.75rem',
  '2xl': '1rem',
},

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

Tokens opcionales de display (la familia decide si usarlos):

```ts
fontSize: {
  'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
  'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
  'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.015em' }],
},
```

---

## 4. Seleccion de familia segun `design_system.vibe`

Carga **EXACTAMENTE UNA** de estas skills. No las mezcles:

| `design_system.vibe` | Skill a cargar |
|---|---|
| `high-end` | `.claude/skills/taste-design/high-end-visual-design/SKILL.md` |
| `minimalist` | `.claude/skills/taste-design/minimalist-ui/SKILL.md` |
| `brutalist` | `.claude/skills/taste-design/industrial-brutalist-ui/SKILL.md` |

La familia decide: layout (Hero, secciones internas, Footer), anatomia de seccion (con o sin eyebrow + H2 + subtitle + divider), recetas de componentes (botones, cards, navegacion, dots), tipografia (escala/peso/tracking sobre las fuentes del brief), grid patterns, surfaces, ritmo visual, paddings verticales.

---

## 5. Seleccion de motion segun `design_system.motion`

| `design_system.motion` | Comportamiento |
|---|---|
| `calm` | Carga `motion-calm-preset.md` (este folder). FadeIn / FadeInStagger scroll-triggered, cubic-bezier `[0.22, 1, 0.36, 1]`, sin loops infinitos. La familia NO sobrescribe motion. |
| `fluid` | Motion la decide la skill de familia. Cubic-bezier o springs suaves. Sin loops perpetuos. |
| `perpetual` | Motion la decide la skill de familia. Springs + loops infinitos (Pulse, Float, Shimmer, etc.) permitidos. |

Independiente del valor, **siempre** respetar `prefers-reduced-motion` (ver seccion 8 y `motion-calm-preset.md`).

---

## 6. Skills transversales (siempre activas en sesiones de UI)

| Skill | Que aplica | Que NO aplica |
|---|---|---|
| `.claude/skills/taste-design/design-taste-frontend/SKILL.md` | Seccion 5 (Performance Guardrails), seccion 7 (AI Tells / Forbidden Patterns), **y dos reglas de seccion 2**: **ANTI-EMOJI POLICY** (nunca emojis en codigo, markup, texto o alt) y **DEPENDENCY VERIFICATION** (revisar `package.json` antes de importar cualquier libreria de terceros). | Resto de seccion 2 (Phosphor-only, Tailwind v3/v4 lock, RSC defaults — esos los cubre `arquitectura-fabrica` o el motor). Secciones 1, 3, 4, 6, 8, 9, 10: las decide la familia. |
| `.claude/skills/taste-design/full-output-enforcement/SKILL.md` | Todo. Politica anti-truncamiento aplicada al output al usuario, no a templates internos. | — |

Skills **condicionales** (solo si la tarea las invoca):

| Skill | Cuando |
|---|---|
| `.claude/skills/taste-design/redesign-existing-projects/SKILL.md` | Rediseno de sitios NO construidos con la fabrica. Dentro del motor su "Design Audit" sirve solo como checklist puntual; NO sobrescribe arquitectura. |
| `.claude/skills/taste-design/stitch-design-taste/SKILL.md` | Target es Google Stitch. |

---

## 7. Regla de precedencia (no negociable)

**El brief siempre gana sobre la familia.** Si los tokens del brief contradicen lo que recomienda la familia (por ejemplo: brief = `Plus Jakarta Sans + Playfair Display`, familia `brutalist` recomienda `Archivo Black + JetBrains Mono`), se usan los del brief y la familia **adapta** peso, tracking, escala y composicion sobre esos tokens. La familia **nunca** sustituye tokens del cliente — solo decide arquitectura visual, layout, motion y composicion.

Si la contradiccion es tan severa que la familia se vuelve imposible de aplicar coherentemente, **PARA y avisa al usuario**: probablemente el `vibe` del brief no encaja con sus tokens y hay que decidir cual cambia.

---

## 8. Accesibilidad — Reglas no negociables

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

## 9. `globals.css` — Base CSS obligatoria

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

## 10. Lo que NO debes hacer

- Hardcodear colores, textos o URLs en JSX (todo via tokens del brief + `next-intl`).
- Cargar mas de UNA skill de familia simultaneamente (`high-end`, `minimalist`, `brutalist` son **excluyentes**).
- Aplicar reglas de motion de la familia cuando `motion: calm` — en ese caso manda `motion-calm-preset.md`.
- Adivinar `vibe` o `motion` si faltan en el brief — para y pregunta.
- Sustituir fuentes o colores del brief por las que recomienda la familia (la regla 7 manda).
- Generar UI sin haber cargado la skill de familia correspondiente.
- Cambiar el container global `max-w-7xl px-6 lg:px-8`.
- Ignorar accesibilidad o `prefers-reduced-motion` por estetica.

---

## Checklist final

Antes de entregar:

- [ ] `design_system.vibe` y `design_system.motion` presentes en el brief.
- [ ] Tokens del brief mapeados a Tailwind (colors + fontFamily + tokens UI estandar).
- [ ] Skill de familia cargada (una sola) segun `vibe`.
- [ ] Preset de motion correcto: `calm` → `motion-calm-preset.md`; `fluid` / `perpetual` → la familia.
- [ ] `design-taste-frontend` (secciones 5 + 7) aplicada como filtro transversal.
- [ ] `full-output-enforcement` aplicada al output al usuario.
- [ ] Container `mx-auto max-w-7xl px-6 lg:px-8` en toda seccion, Header y Footer.
- [ ] HTML semantico + `aria-labelledby` en sections + focus visible.
- [ ] `prefers-reduced-motion` respetado en CSS y Framer Motion.
- [ ] Contraste WCAG AA validado.
- [ ] Cero hex / strings hardcodeados.
- [ ] Textos via `next-intl`, no hardcodeados.
