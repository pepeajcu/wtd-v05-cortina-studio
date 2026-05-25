# Fábrica de sitios premium — Next.js 14 + WordPress headless

Repo base **replicable** para sitios premium con CMS headless. Este NO es el sitio de un cliente: es el motor. El cliente actual ocupando los slots de configuración es **Cortina Studio**; cualquier futuro cliente reemplaza esos archivos sin tocar el motor.

Stack: **Next.js 14 (App Router, RSC) · TypeScript · Tailwind · next-intl · WPGraphQL · JetEngine · plugin propio `cortinastudio-wpgraphql-bridge`**.

---

## Reglas no negociables

1. **Separación motor vs cliente.** Lo que cambia por cliente vive SOLO en:
   - `client-brief.json`
   - `wp-config.json`
   - `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json`
   - `messages/{es,en}.json`
   - `tailwind.config.ts`
   - `app/[locale]/page.tsx`
   - `components/sections/*`
   - `.env.local`

   Si un cambio te obliga a tocar otra cosa, **es evolución del motor** — no parche del cliente.

2. **Mirror obligatorio** entre `wp-config.json.fields.*` (camelCase) y `bridge-fields.json` (snake_case). En el mismo PR.

3. **Revalidación por tag, nunca por path.** Solo `revalidateTag()` con las constantes de `lib/wordpress/tags.ts`.

4. **Sin Apollo, sin REST, sin `functions.php`.** El stack es `wpFetch` + `graphql-request` + plugin propio.

Más detalle en `CLAUDE.md` y las skills bajo `.claude/skills/`.

---

## Setup local

```bash
npm install
cp .env.example .env.local      # rellenar las 4 variables
npm run codegen                  # genera lib/graphql/generated/index.ts
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Variables de entorno (`.env.local`)

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Endpoint GraphQL del CMS (gana sobre `wp-config.json.endpoint`) |
| `WORDPRESS_REVALIDATION_SECRET` | Secret que valida POST a `/api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del frontend |
| `WORDPRESS_PREVIEW_SECRET` | Secret para preview mode (futuro) |

---

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Dev server (Next sin cache de fetches; refresca al editar en WP sin esperar webhook) |
| `npm run build` | Build de producción (requiere `.env.local`) |
| `npm run start` | Servidor de producción (aquí sí aplica el cache + `revalidateTag`) |
| `npm run lint` | ESLint sobre todo el repo |
| `npm run codegen` | Lee `lib/graphql/queries/*.graphql` + `lib/graphql/schema.json` → genera `lib/graphql/generated/index.ts` |
| `npm run codegen:watch` | Codegen en modo watch |
| `npm run schema:fetch` | Introspección remota; refresca `lib/graphql/schema.json` |

---

## Estructura del repo

```
app/
  [locale]/              # Rutas localizadas (es | en) con next-intl
  api/revalidate/        # POST con secret → revalidateTag(tag)
components/
  motion/                # FadeIn, FadeInStagger (motor, no tocar por cliente)
  sections/              # Hero, ProblemsSection, ReelsSection, ProcessSection (cambian por cliente)
  ui/                    # Primitivos compartidos
lib/
  wordpress/             # wpFetch, fetchers tipados, tags, config (motor)
  graphql/
    queries/             # .graphql por dominio (input del codegen)
    generated/           # Salida del codegen — NO editar a mano
  iconMap.tsx            # Registry centralizado de iconos
messages/                # es.json, en.json (next-intl)
wordpress/plugins/cortinastudio-wpgraphql-bridge/
  *.php                  # Plugin propio (motor — no tocar por cliente)
  bridge-fields.json     # Mirror de wp-config.json.fields (cambia por cliente)
recursos/                # Plantillas y exports (ver recursos/README.md)
docs/specs/              # Specs cerradas — no leer salvo petición explícita
memoryLTS/               # Índice de sesiones para contexto histórico
.claude/skills/          # Skills cargables del runner Claude Code
.opencode/skills/        # Espejo para OpenCode
```

---

## Playbook de replicación a un cliente nuevo

> Resumen ejecutivo. La checklist completa por fase está en la skill `replicacion-cliente` (`.claude/skills/replicacion-cliente/SKILL.md`).

### Fase 1 — Frontend (1–2 días)

1. Clonar el repo. Verificar que `lib/wordpress/`, `app/api/revalidate/`, `components/motion/` y `codegen.ts` están intactos.
2. Reemplazar `client-brief.json` con el del cliente nuevo. **Confirmar `design_system.vibe` y `design_system.motion`** (sin esos campos `diseno-fabrica` no puede arrancar).
3. Mapear paleta y tipografías en `tailwind.config.ts`. Cargar fuentes con `next/font/google` en `app/[locale]/layout.tsx`.
4. Editar `wp-config.json`: `endpoint`, `siteUrl`, `cpt.*`, `fields.*` (placeholders; se ajustan en Fase 3).
5. Crear `.env.local` con las 4 variables.
6. `npx tsc --noEmit` sin errores nuevos.

### Fase 2 — Backend WordPress (1 día)

1. WordPress nuevo con HTTPS y dominio propio (`cms.<dominio>`).
2. Instalar y activar: **WPGraphQL**, **JetEngine**, **WP Webhooks** (Cozmoslabs), Rank Math, Safe SVG, optimizador de imágenes.
3. Subir el plugin `cortinastudio-wpgraphql-bridge` a `wp-content/plugins/`. Activarlo.
4. Crear los CPTs en JetEngine. Anotar los slugs reales.
5. Crear los meta fields (scalar y repeater) en cada CPT. Anotar los meta keys.
6. (Opcional) Importar `recursos/jetengine-cortinastudio.json` como base y renombrar.
7. Editar `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` con los meta keys exactos. Subirlo al servidor.
8. Validar en `Settings → WPGraphQL Bridge` que los CPTs aparezcan expuestos. Probar queries en GraphiQL IDE.
9. Configurar webhook saliente en `WP Webhooks → Send Data`: `POST https://<sitio>/api/revalidate?secret=<WORDPRESS_REVALIDATION_SECRET>` con body `{ "tag": "wp:<dominio>" }`.

### Fase 3 — Conexión (1 día)

1. Sincronizar `wp-config.json.fields.*` (camelCase) con los meta keys reales.
2. Escribir queries en `lib/graphql/queries/*.graphql` (una por dominio).
3. `npm run codegen` para generar tipos.
4. Crear fetchers `lib/wordpress/getX.ts`: `wpFetch` + tag de `WP_TAGS` + Zod en repeaters.
5. Reemplazar arrays estáticos en `components/sections/*` por props desde el fetcher.

### Fase 4 — Validación final

- `npx tsc --noEmit` + `npm run lint` + `npm run build` pasan sin errores nuevos.
- Editar un post en WP → webhook llega a `/api/revalidate` → la página se actualiza en segundos sin redeploy.
- Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms.

---

## Verificación tras cualquier cambio significativo

```bash
npx tsc --noEmit
npm run lint
npm run codegen          # solo si tocaste lib/graphql/queries/ o el schema
```

---

## Documentación adicional

- `CLAUDE.md` / `AGENTS.md` — instrucciones globales para los agentes (idénticos byte a byte).
- `.claude/skills/` — skills cargables por dominio: `arquitectura-fabrica`, `diseno-fabrica`, `data-layer`, `wordpress-bridge`, `i18n-fabrica`, `replicacion-cliente`.
- `lib/wordpress/README.md` — playbook breve de la capa de datos.
- `memoryLTS/memory.md` — índice cronológico de sesiones relevantes.

---

## Estado actual

- **Fase 1 — Base de fábrica** ✅
- **Fase 2 — Backend WordPress (Cortina Studio)** ✅
- **Fase 3 — Queries y fetchers** ✅ (2026-05-16)
- **Fase 4 — Migración del Home** ✅ (2026-05-16, código completo; validación end-to-end del webhook pendiente para Fase 5)
- **Fase 5 — QA y replicación** — en curso. Ver `docs/specs/001-plan-inicial/task.md`.
