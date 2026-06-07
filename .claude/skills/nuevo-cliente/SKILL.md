---
name: nuevo-cliente
description: EMPIEZA AQUI para levantar un cliente nuevo. Orquestadora interactiva que conduce el levantamiento de cero a publicado fase por fase, carga las skills en orden y valida cada compuerta antes de avanzar. Cargar cuando se inicie/levante un cliente nuevo o se invoque /nuevo-cliente. No duplica las skills de dominio ni el contrato; las dirige.
---

# Nuevo Cliente — Orquestadora de Levantamiento

Soy el **director de obra**: conduzco el flujo de levantar un cliente nuevo. No soy el contenido. Cada fase dice **que skill cargar**, **que hacer** (una linea) y **la compuerta** que debe pasar antes de avanzar. El *como* detallado vive en las skills que cargo; el *contrato* (que cambia por cliente, reglas de oro, test motor-vs-cliente) vive en `replicacion-cliente`.

**Reglas de conduccion:**
- No avanzo de fase hasta que su compuerta pase. En los hitos marcados **PAUSA**, espero OK explicito del usuario.
- No reexplico el "como" de un dominio: si necesito el detalle, cargo la skill.
- Todo bloqueo, deuda o cosa fuera-de-alcance → `pendientes.md` del cliente; no se pierde.
- Si un cambio sale de la columna izquierda del contrato → PARA, es evolucion del motor (ver `replicacion-cliente` §2).

---

## Paso 0 — Bootstrap (al arrancar)

1. Pregunta al usuario el slug del cliente (`<cliente>`) y su `<dominio>`.
2. Calcula el siguiente correlativo libre `NNN` (mira `docs/specs/`, mayor prefijo numerico + 1).
3. Copia `docs/specs/_plantilla-cliente/{task.md, pendientes.md}` → `docs/specs/NNN-<cliente>/`.
4. Rellena los huecos `<cliente>`/`<dominio>` en el `task.md` copiado.
5. Desde aqui, marca el avance en ese `task.md` (no en la plantilla).

---

## Flujo con compuertas

### Fase 0 — Brief
- **Carga:** `replicacion-cliente` (contrato).
- **Haz:** lee `client-brief.json` del cliente. Desde `estructura de paginas`, **enumera las rutas que necesita el cliente**: la home mas las adicionales (catalogo de productos/servicios, paginas informativas, landings). Si el brief no las trae, preguntaselas al usuario. Anota la lista en el `task.md` del cliente.
- **COMPUERTA:** `design_system.vibe` (`high-end`\|`minimalist`\|`brutalist`) y `design_system.motion` (`calm`\|`fluid`\|`perpetual`) poblados con enum valido (si faltan, definelos con el usuario), **y la lista de rutas del cliente esta definida** (no solo la home).

### Fase 1 — Frontend
- **Carga:** `diseno-fabrica` (+ familia segun `vibe`) e `i18n-fabrica`.
- **Haz:** tokens en `tailwind.config.ts`, fuentes en `layout.tsx`, copy completo en `messages/{es,en}.json` (Tier A), `wp-config.json` (solo Tier B/C), `.env.local`.
- **PAUSA (hito):** layout (Header + Footer + `layout.tsx`) aprobado por el usuario antes de construir secciones internas.
- **Haz (rutas adicionales):** tras aprobar el layout, construye las paginas extra de la lista de Fase 0 componiendo secciones reutilizables; su contenido arranca como `content/*.json` (pre-WP, validado con Zod) o `messages/` segun corresponda. Estructura y contenido son del cliente, la maquinaria es del motor (ver `replicacion-cliente`, "Paginas y rutas por cliente").
- **COMPUERTA:** `npx tsc --noEmit` sin errores nuevos.

### Fase 2 — Backend WordPress
- **Carga:** `wordpress-bridge`.
- **Haz:** WP + plugins del stack, plugin propio activo, CPTs `<cpt>` + Options `general` (solo Tier B/C), `bridge-fields.json` ↔ `wp-config.json` en mirror, webhooks salientes.
- **COMPUERTA:** CPTs/Options expuestos y queries devuelven datos en GraphiQL.

### Fase 3 — Conexion
- **Carga:** `data-layer`.
- **Haz:** queries `.graphql` por dominio, `npm run codegen`, fetchers `getX.ts` (`wpFetch` + tag + Zod en repeaters; ver `data-layer` §5.1 repeaters, §5.2 media).
- **COMPUERTA:** los fetchers devuelven datos reales del CMS.

### Fase 4 — Migracion
- **Carga:** `data-layer`, `i18n-fabrica`.
- **Haz:** `page.tsx` (RSC) llama los fetchers; las secciones consumen Tier A via i18n y reciben Tier B/C por props; elimina arrays hardcodeados.
- **COMPUERTA:** `npx tsc --noEmit` + `npm run lint` + `npm run build` verdes; el sitio se ve igual con datos reales.

### Fase 5 — QA y publicacion
- **Haz:** valida el webhook end-to-end, revalidacion por tag por cada CPT/Options, fallback con WP caido.
- **COMPUERTA:** Core Web Vitals en rango (LCP < 2.5s, CLS < 0.1, INP < 200ms) + checklist de calidad premium (ver `diseno-fabrica`).

---

## Lo que NO hago

- No copio el contenido de las skills de dominio ni de `replicacion-cliente` — las cargo y delego.
- No avanzo de fase con la compuerta a medias.
- No genero codigo sin leer `client-brief.json` primero (Fase 0).
- No parcheo el motor para resolver un caso del cliente: lo escalo como evolucion (ver `replicacion-cliente` §2) y lo anoto en `pendientes.md`.
