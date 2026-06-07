# Tasks — <cliente>: levantamiento

> Copia de `docs/specs/_plantilla-cliente/task.md` generada por la orquestadora `nuevo-cliente`.
> **Instancia de progreso.** El *como* vive en las skills y en la orquestadora; aqui solo se marca el avance y se apunta a la skill de cada fase. El *contrato* (que cambia por cliente, reglas de oro, test motor-vs-cliente) esta en la skill `replicacion-cliente`.
> Fases secuenciales con compuertas: no avanzar hasta que la compuerta de la fase anterior pase y, en los hitos marcados, el usuario apruebe.
> Backlog vivo (deudas, bloqueos, fuera-de-alcance) → `pendientes.md` en esta misma carpeta.

**Datos del cliente a rellenar:** `<cliente>` (slug) · `<dominio>` · `<cpt>` (CPTs dinamicos: proyectos/blog/...).

---

## Fase 0 — Brief

> Skill: `replicacion-cliente` (contrato). Insumo: `client-brief.json`.

- [ ] `client-brief.json` reemplazado con el del cliente `<cliente>`.
- [ ] **Compuerta:** `design_system.vibe` (`high-end`\|`minimalist`\|`brutalist`) y `design_system.motion` (`calm`\|`fluid`\|`perpetual`) poblados con valores validos del enum. Sin ellos, `diseno-fabrica` no puede seleccionar familia ni preset de motion.

## Fase 1 — Frontend

> Skills: `diseno-fabrica` (+ familia segun `vibe`), `i18n-fabrica`. Contrato: `replicacion-cliente` §1.

- [ ] `tailwind.config.ts`: colores y tipografias del brief.
- [ ] Fuentes cargadas con `next/font/google` en `app/[locale]/layout.tsx`.
- [ ] `messages/{es,en}.json`: copy completo del cliente (Tier A).
- [ ] `wp-config.json`: `endpoint`, `siteUrl`, `cpt.*`, `fields.*` (solo Tier B/C).
- [ ] `.env.local` con las variables de entorno.
- [ ] **Hito de aprobacion (PAUSA):** layout (Header + Footer + `layout.tsx`) aprobado por el usuario antes de construir secciones internas.
- [ ] **Compuerta:** `npx tsc --noEmit` sin errores nuevos.

## Fase 2 — Backend WordPress

> Skill: `wordpress-bridge`. Solo Tier B/C (datos operativos + contenido dinamico).

- [ ] WP nuevo (HTTPS, `cms.<dominio>`) + plugins del stack instalados (ver `wordpress-bridge` §1).
- [ ] Plugin `cortinastudio-wpgraphql-bridge` subido y activo.
- [ ] CPTs dinamicos `<cpt>` + Options Page `general` creados; meta fields solo Tier B/C.
- [ ] `bridge-fields.json` ↔ `wp-config.json.fields` en **mirror** (regla de oro).
- [ ] Webhooks salientes configurados (ver `wordpress-bridge` §4).
- [ ] **Compuerta:** CPTs/Options expuestos y las queries devuelven datos en GraphiQL.

## Fase 3 — Conexion

> Skill: `data-layer`.

- [ ] Queries `.graphql` por dominio en `lib/graphql/queries/`.
- [ ] `npm run codegen` OK.
- [ ] Fetchers `lib/wordpress/getX.ts`: `wpFetch` + tag de `WP_TAGS` + Zod en repeaters (ver `data-layer` §5.1 repeaters, §5.2 media).
- [ ] **Compuerta:** los fetchers devuelven datos reales del CMS.

## Fase 4 — Migracion

> Skills: `data-layer`, `i18n-fabrica`.

- [ ] `app/[locale]/page.tsx` (RSC) llama los fetchers; las secciones consumen Tier A via i18n y reciben Tier B/C por props.
- [ ] Arrays hardcodeados eliminados.
- [ ] **Compuerta:** `npx tsc --noEmit` + `npm run lint` + `npm run build` verdes; el sitio se ve igual con datos reales.

## Fase 5 — QA y publicacion

- [ ] Editar un post en WP → el webhook llega a `/api/revalidate` → la pagina se actualiza sin redeploy.
- [ ] Revalidacion por tag correcta por cada CPT/Options.
- [ ] Fallback con WP caido: el sitio sirve cache stale o `notFound()` controlado, no crashea.
- [ ] **Compuerta:** Core Web Vitals en rango (LCP < 2.5s, CLS < 0.1, INP < 200ms) + checklist de calidad premium (ver `diseno-fabrica`).

---

## Verificaciones de contrato (test motor-vs-cliente)

> Ver `replicacion-cliente` §2 (test binario).

- [ ] Cero cambios fuera de la columna izquierda del contrato. Si algo obligo a tocar el motor, se escalo como evolucion (no parche) y se anoto en `pendientes.md`.
- [ ] Mirror `bridge-fields.json` ↔ `wp-config.json.fields` intacto.
- [ ] Solo `revalidateTag`, nunca `revalidatePath`. Tags siempre desde `lib/wordpress/tags.ts`.
