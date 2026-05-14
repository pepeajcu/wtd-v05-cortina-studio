# Motion Calm Preset

Preset de animacion del motor para clientes con `design_system.motion: "calm"`. Cuando este preset esta activo, la skill de familia (`high-end-visual-design`, `minimalist-ui` o `industrial-brutalist-ui`) **NO** sobrescribe motion — sus reglas de springs, perpetual loops o cinematic choreography quedan suspendidas.

Filosofia: scroll-triggered, cubic-bezier, sin loops infinitos, calmado y editorial.

---

## 1. Easing global

```ts
const EASING = [0.22, 1, 0.36, 1] as const;
```

Disponible en Tailwind como `ease-premium`. Se usa en **TODAS** las animaciones sin excepcion.

---

## 2. FadeIn (scroll-triggered, reutilizable)

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

---

## 3. FadeInStagger (cards, listas)

```ts
container: { hidden: {}, visible: { transition: { staggerChildren: configurable } } }
item: {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}
viewport: { once: true, margin: '-64px' }
```

Stagger values:
- Cards (3-4): `0.12`
- Timeline / pasos (4+): `0.15`
- Listas rapidas (6+): `0.08`
- Default: `0.1`

---

## 4. Hero FadeUp (secuencia cinematica)

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

Secuencia de delays del Hero:

| Elemento | Delay |
|----------|-------|
| Eyebrow | `0` |
| H1 | `0.1` |
| Divider (scaleX) | `0.22` |
| Subtitle | `0.25` |
| CTAs | `0.38` |
| Stats/badges | `0.5` |

Divider del Hero:
```ts
initial: { scaleX: 0, originX: 0 }
animate: { scaleX: 1 }
transition: { duration: 0.6, delay: 0.22, ease: EASING }
```

---

## 5. RotatingWord / ProcessTitle

```ts
// AnimatePresence mode="wait"
initial: { opacity: 0, y: 10 }
animate: { opacity: 1, y: 0 }
exit:    { opacity: 0, y: -10 }
transition: { duration: 0.35, ease: EASING }

// Intervalo: 2500ms entre palabras
// Estilo de la palabra: font-display italic text-accent
```

---

## 6. Carousel Slide

```ts
initial: { opacity: 0, scale: 1.03 }
animate: { opacity: 1, scale: 1 }
exit:    { opacity: 0, scale: 0.98 }
transition: { duration: 0.6, ease: EASING }
```

---

## 7. Accordion

```ts
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
exit:    { height: 0, opacity: 0 }
transition: { duration: 0.38, ease: EASING }
```

---

## 8. FAB entrada

```ts
initial: { opacity: 0, scale: 0.6, y: 20 }
animate: { opacity: 1, scale: 1, y: 0 }
transition: { delay: 0.8, duration: 0.5, ease: EASING }
```

---

## 9. Tooltip FAB

```ts
initial: { opacity: 0, x: 8 }
animate: { opacity: 1, x: 0 }
exit:    { opacity: 0, x: 8 }
transition: { duration: 0.25, ease: EASING }
```

---

## 10. CSS Transitions (Tailwind, micro-interacciones)

```
Botones:    transition-all duration-300 ease-premium
Colores:    transition-colors duration-200
Transforms: transition-transform duration-300 ease-premium
Overlay:    transition-transform duration-500 ease-premium
Opacity:    transition-opacity duration-700 ease-premium
Header:     transition-all duration-500 ease-premium
```

---

## 11. Reduced Motion — Obligatorio

```ts
const reduced = useReducedMotion();

// Si reduced:
// - Omitir translate/scale, mantener solo opacity
// - Reducir duracion a 0.2s
// - Eliminar delays
// - Detener rotaciones de palabras (mostrar solo la primera)
```

Ademas, `globals.css` ya neutraliza animaciones via `@media (prefers-reduced-motion: reduce)` — ver seccion 9 de `SKILL.md`.

---

## Cuando NO aplica este preset

Si `design_system.motion` es `"fluid"` o `"perpetual"`, este archivo se ignora. La skill de familia decide motion (springs, perpetual loops, scroll-triggered cinematics, lo que la familia mande).
