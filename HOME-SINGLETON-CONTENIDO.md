# Llenar `home-singleton` en JetEngine — Guia operativa

> Checklist para cerrar el bullet pendiente de **Fase 3.6** (`docs/specs/001-plan-inicial/task.md`).
> Se hace en: **WordPress → JetEngine → Post Types → home-singleton → Meta Fields**, y luego editando el post unico `home-singleton` (ID 26).
> Fuentes: `memoryLTS/memory_2026-05-15-1.md` y `memoryLTS/memory_2026-05-15-2.md`.

---

## Reglas no negociables (leer primero)

- **Case-sensitive en todo.** `heat` ✅ — `Heat` ❌. `Thermometer` ✅ — `thermometer` ❌.
- **Los slugs deben coincidir EXACTO** con los definidos en `wp-config.json.iconMap`. Si pones un valor que no esta en el mapping, el frontend no encuentra el icono.
- **`number` es campo Numeric** en JetEngine (no Text). El motor lo coerce con `z.coerce.number().int().min(1).max(4)`.
- **Parafraseable:** `title`, `description`, `word`.
- **NO parafraseable (slugs literales):** `key`, `icon`, `number`, `gender`.
- Tras guardar, invalidar cache de Next (ver seccion **Validacion final** al pie).

---

# 1. Repeater `problems_cards`

> Total: **4 items**. Mapping fuente: `wp-config.json.iconMap.problems`.

## 1.A — Estructura de sub-campos en JetEngine

Si los sub-campos no existen con estos nombres exactos, recrearlos:

- **`key`** — Type: `Text` — slug literal (ver items abajo)
- **`icon`** — Type: `Text` — nombre EXACTO del componente Lucide
- **`title`** — Type: `Text` — parafraseable
- **`description`** — Type: `Textarea` — parafraseable

## 1.B — Contenido de los 4 items

### Item 1

- **key:** `heat`
- **icon:** `Thermometer`
- **title:** Tu casa se siente como un horno
- **description:** El sol entra directo y el aire acondicionado no da abasto.

### Item 2

- **key:** `privacy`
- **icon:** `EyeOff`
- **title:** Sientes que los vecinos ven todo
- **description:** Te falta privacidad sin tener que vivir en la oscuridad.

### Item 3

- **key:** `noise`
- **icon:** `VolumeX`
- **title:** El ruido de la calle no te deja descansar
- **description:** Buscas silencio y tranquilidad en tu propio hogar.

### Item 4

- **key:** `decor`
- **icon:** `Sparkles`
- **title:** Tu espacio se ve incompleto
- **description:** Quieres ese toque final que transforme toda la decoracion.

---

# 2. Repeater `process_steps`

> Total: **4 items**. Mapping fuente: `wp-config.json.iconMap.process`.
> **Caso especial:** `whatsapp` no es un icono de Lucide — es un SVG custom local (`WhatsAppIcon`), resuelto en `components/sections/ProcessSection.tsx`.

## 2.A — Estructura de sub-campos en JetEngine

- **`number`** — Type: `Number` — entero 1-4, define el orden visual
- **`icon`** — Type: `Text` — slug literal del iconMap
- **`title`** — Type: `Text` — parafraseable
- **`description`** — Type: `Textarea` — parafraseable

## 2.B — Contenido de los 4 items

### Item 1

- **number:** `1`
- **icon:** `whatsapp`
- **title:** Escribenos por WhatsApp
- **description:** Cuentanos que problema quieres resolver. Sin compromiso.

### Item 2

- **number:** `2`
- **icon:** `mappin`
- **title:** Visita y asesoria gratis
- **description:** Vamos a tu hogar, medimos y te asesoramos en sitio.

### Item 3

- **number:** `3`
- **icon:** `palette`
- **title:** Diseno y cotizacion
- **description:** Te presentamos opciones adaptadas a tu estilo y presupuesto.

### Item 4

- **number:** `4`
- **icon:** `wrench`
- **title:** Instalacion profesional
- **description:** Nos encargamos de todo. Tu solo disfruta el resultado.

---

# 3. Repeater `process_rotating_words`

> Total recomendado: **2-3 items**. Si lo dejas vacio, el `<h2>` no rotara pero `getHome()` NO falla.

## 3.A — Estructura de sub-campos en JetEngine

- **`word`** — Type: `Text` — palabra que rota en el `<h2>`
- **`gender`** — Type: `Text` — `m` o `f` (un solo caracter); conjuga el articulo del copy circundante

## 3.B — Contenido recomendado

### Item 1

- **word:** `proyecto`
- **gender:** `m`

### Item 2

- **word:** `espacio`
- **gender:** `m`

### Item 3

- **word:** `casa`
- **gender:** `f`

---

# 4. Repeater `reels_selected`

> Total: **3-5 items**.
> **Decision arquitectonica** (`memoryLTS/memory_2026-05-15-1.md`): se implementa como Repeater con un unico sub-campo `id` tipo `Posts`. NO se usa la feature "Relations" de Crocoblock — vive en tabla custom y el plugin bridge no la ve.

## 4.A — Estructura del sub-campo en JetEngine

Un solo sub-campo:

- **Name (literal):** `id`  ← NO usar `reels_selected_id` ni prefijos
- **Type:** `Posts`
- **Post Type:** `proyecto`
- **Allow multiple:** `NO`

## 4.B — Contenido

Editar el post `home-singleton`, ir al repeater `reels_selected`, agregar 3-5 items. En cada uno seleccionar un proyecto distinto del selector Posts.

## 4.C — Shape esperado en GraphQL

```json
"{\"item-0\":{\"id\":\"15\"},\"item-1\":{\"id\":\"23\"}, ...}"
```

Coincide con `reelSelectedSchema` (`{slug?, id?}.passthrough()`) ya definido en `lib/wordpress/getHome.ts` — sin tocar codigo del fetcher.

---

# Validacion final

Una vez completados los 4 repeaters y guardado el post:

## Paso 1 — Invalidar cache de Next

```
POST https://cortinastudio.gainweb.site/api/revalidate?secret=<WORDPRESS_REVALIDATION_SECRET>
Content-Type: application/json

{"tag": "wp:home"}
```

## Paso 2 — Reintentar `getHome()`

- Via route handler de debug `/api/debug/fetchers` (el que usaste el 2026-05-15), **o**
- Ejecutar la query en WPGraphQL IDE directo.

## Paso 3 — Criterio de exito

`getHome()` parsea sin errores Zod y retorna los 4 repeaters poblados.

## Paso 4 — Si pasa

- Marcar como completo el ultimo bullet `[~]` de **Fase 3.6** en `docs/specs/001-plan-inicial/task.md`.
- Arrancar **Fase 4 — Migracion del Home**.
