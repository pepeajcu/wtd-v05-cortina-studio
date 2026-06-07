# Tasks — 001 Plan Inicial: Conexion WordPress ↔ Next.js

> Checklist verificable. Cada caja se marca a medida que se ejecuta. Las fases son secuenciales: NO empezar una fase hasta que la anterior este completa y el usuario la apruebe.

> **Pendientes / backlog de Cortina** (deudas, bloqueos por infra, fuera-de-alcance): ver `pendientes.md` en esta misma carpeta. Las cajas de abajo son el avance del plan inicial; el backlog vivo se lleva alli.

---

## Fase 0 — Spec (esta carpeta)

- [x] Crear `docs/specs/001-plan-inicial/proposal.md` con arquitectura, CPTs, campos y principios de diseno.
- [x] Crear `docs/specs/001-plan-inicial/task.md` (este archivo).

## Hito de aprobacion

- [x] Mostrar plan resumido al usuario.
- [x] Esperar OK explicito antes de ejecutar Fase 1.

---

## Fase 1 — Base estandar de fabrica (infraestructura)

> Estado: ✅ Completa al 2026-05-13. Detalles de desviaciones documentadas en `addendum-2026-05-13.md` (codegen apunta a schema local, un solo archivo generado, `scripts/fetch-schema.mjs` adicional).
> **NO tocar:** `components/`, `app/[locale]/`, `messages/`, `middleware.ts`, `i18n/request.ts`, `tailwind.config.ts`, `app/globals.css`.

### 1.1 Dependencias

- [x] Instalar dependencias de produccion: `graphql`, `graphql-request`, `zod`.
- [x] Instalar dependencias de desarrollo: `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, `@graphql-codegen/typed-document-node`, `@graphql-codegen/typescript-graphql-request`.

### 1.2 Archivos de configuracion

- [x] Verificar que `wp-config.json` existe en raiz y es JSON valido.
- [x] Crear `.env.example` con las 4 variables estandar (`NEXT_PUBLIC_WORDPRESS_API_URL`, `WORDPRESS_REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `WORDPRESS_PREVIEW_SECRET`).
- [x] Verificar que `tsconfig.json` tiene `resolveJsonModule: true` y `esModuleInterop: true`.

### 1.3 Capa `lib/wordpress/`

- [x] Crear `lib/wordpress/config.ts` — carga y valida `wp-config.json` con Zod.
- [x] Crear `lib/wordpress/tags.ts` — constantes `WP_TAGS` y `ALL_WP_TAGS`.
- [x] Crear `lib/wordpress/client.ts` — `wpFetch()` con `fetch` nativo de Next + tags + revalidate.
- [x] Crear `lib/wordpress/index.ts` — barrel export de config, client y tags.
- [x] Crear `lib/wordpress/README.md` — playbook breve de la capa.

### 1.4 Endpoint de revalidacion

- [x] Crear `app/api/revalidate/route.ts` — POST valida secret + llama `revalidateTag()`, GET es healthcheck.

### 1.5 Codegen

- [x] Crear `codegen.ts` en raiz con configuracion de `@graphql-codegen`. *(Desviacion: lee `lib/graphql/schema.json` local en vez del endpoint — workaround BOM. Ver addendum §2.5.)*
- [x] Agregar scripts `codegen` y `codegen:watch` a `package.json`. *(Anadido `schema:fetch` para introspeccion separada via `scripts/fetch-schema.mjs`.)*
- [x] Crear `lib/graphql/generated/.gitkeep`.
- [x] Crear `lib/graphql/queries/.gitkeep`.

### 1.6 Verificacion Fase 1

- [x] `npx tsc --noEmit` — 0 errores nuevos.
- [x] `npm run lint` — sin errores nuevos en archivos de esta fase.
- [x] `npm run build` — exitoso (puede fallar si falta `.env.local`; documentar y continuar).
- [x] Confirmar que ningun archivo bajo `components/`, `app/[locale]/`, `messages/` fue modificado.

---

## Fase 2 — WordPress backend (manual, lo hace el usuario)

> Estado: ✅ Completa al 2026-05-13 (Options Page `general` aun no expuesta a GraphQL — ver Fase 3.3 abajo). Cambio de enfoque critico: el modulo "JetEngine WPGraphQL Integration" no existe, fue reemplazado por el plugin propio `cortinastudio-wpgraphql-bridge` v3.0.0. Detalles en `addendum-2026-05-13.md` §2.2.
> Esta fase la ejecuta el usuario en el panel de WordPress. Claude puede proveer instrucciones paso a paso o el JSON de exportacion de JetEngine si se solicita.

### 2.1 Plugins

- [x] Instalar y activar **WPGraphQL**.
- [x] Instalar y activar **JetEngine** (Crocoblock).
- [x] ~~Activar modulo **JetEngine — WPGraphQL Integration**~~ → Reemplazado por el plugin propio `cortinastudio-wpgraphql-bridge` (ver addendum §2.2). Modulo de la spec no existe en JetEngine 3.8+.
- [x] Instalar plugin de webhooks (WP Webhooks de Cozmoslabs).
- [x] (Recomendado) Instalar **Rank Math** (en vez de WPGraphQL SEO descontinuado — ver addendum §2.3), **Safe SVG**, optimizador de imagenes.

### 2.2 CPTs y campos

- [x] Crear CPT `home` con slug real `home-singleton` (ver addendum §2.1): `has_archive: false`, expuesto a GraphQL via plugin propio como `HomeSingleton` / `homeSingletons`.
- [x] Crear todos los meta fields de `home-singleton` segun la tabla de `proposal.md` §4.4 (verificado contra `bridge-fields.json`: 22 escalares + 4 repeaters).
- [x] Crear CPT `proyecto` con slug real plural `proyectos`: `has_archive: true`, expuesto a GraphQL via plugin propio como `Proyecto` / `proyectos`.
- [x] Crear todos los meta fields de `proyectos` segun `proposal.md` §4.4 (10 escalares en `bridge-fields.json`).
- [x] Crear Options Page `general` en JetEngine: slug `general`.
- [x] Crear todos los campos de `general` segun la tabla de `proposal.md` §4.4.
- [x] **Exponer Options Page `general` a GraphQL** — resuelto en plugin v3.1.0 (BLOQUE 2.5). El plugin lee `_options.general` de `bridge-fields.json` y registra el tipo `General` + campo `general` en `RootQuery`, con resolver que prueba 3 patrones de `wp_options`.

### 2.3 Webhook

- [x] Configurar webhook saliente POST a `https://<sitio>/api/revalidate?secret=<WORDPRESS_REVALIDATION_SECRET>`.
- [ ] Incluir body `{ "tag": "wp:home" }` para el CPT home (y analogo para `proyectos` y `general`) — configurado en doc, validacion end-to-end pendiente de Fase 5.

### 2.4 Datos de prueba

- [x] Crear el post singleton de `home-singleton` con datos de prueba en todos los campos.
- [x] Crear al menos 3 posts de `proyectos` con video, poster y campos requeridos.
- [x] Rellenar todos los campos de la Options Page `general`.

### 2.5 Verificacion Fase 2

- [x] Acceder a `https://<cms>/graphql` y verificar que el schema expone `HomeSingleton`, `Proyecto` en el root query. Tipo `general` pendiente (ver 2.2 ultimo bullet).
- [x] Correr una query de prueba en WPGraphQL IDE para `homeSingletons` y `proyectos` (validado en GraphiQL IDE).

---

## Fase 3 — Queries, fetchers y tipos generados

> Estado: ✅ Completa al 2026-05-16. Los 3 fetchers retornan datos reales validados contra CMS. Contenido escalar del Home aun tiene placeholders/typos que el cliente corregira durante Fase 4; no bloquea cierre de Fase 3 (contrato de repeaters validado).

### 3.1 Variables de entorno

- [x] Crear `.env.local` copiando `.env.example` con URL real del CMS y secret de revalidacion. *(Existe desde 2026-04-29 con endpoint Traefik del CMS dev, ambos secrets generados y `NEXT_PUBLIC_SITE_URL` apuntando al mismo host.)*

### 3.2 Queries GraphQL

- [x] Crear `lib/graphql/queries/getHome.graphql` — query para todos los campos del CPT `home-singleton`.
- [x] Crear `lib/graphql/queries/getProyectos.graphql` — query para lista de `proyectos`.
- [x] Crear `lib/graphql/queries/getGeneral.graphql` — query para la Options Page `general` (14 escalares + repeater `navItems`).

### 3.3 Codegen

- [x] Ejecutar `npm run codegen` — genera `lib/graphql/generated/index.ts` *(un solo archivo; ver addendum §2.5)*.
- [x] Verificar que los tipos generados corresponden a los campos definidos en Fase 2.

### 3.4 Fetchers tipados

- [x] Crear `lib/wordpress/getHome.ts` — llama `wpFetch` + valida con Zod + retorna tipo tipado. Schemas Zod inline para los 4 repeaters (`problems_cards`, `reels_selected`, `process_rotating_words`, `process_steps`) con helper `parseRepeater` tolerante a array plano u object indexado.
- [x] Crear `lib/wordpress/getProyectos.ts` (sin repeaters — todos escalares).
- [x] Crear `lib/wordpress/getGeneral.ts` — usa `GetGeneralDocument` / `GetGeneralQuery` del codegen regenerado contra `https://cortinastudio.gainweb.site/graphql`. Schema Zod de `navItems` parte de object indexado `item-N` con keys prefijadas `nav_items_*` y ordena por `nav_items_order` (ver memoria `project-jetengine-options-repeater-shape`).

### 3.5 Mappers ~~separados~~ → inline en fetchers

- [x] ~~`lib/wordpress/mappers/*` como archivos separados~~ → Decision actualizada: hacer el mapeo inline dentro de cada fetcher hasta que aparezca duplicacion real que justifique extraer (ver addendum §2.4).

### 3.6 Verificacion Fase 3

- [x] `npx tsc --noEmit` — 0 errores nuevos en archivos de Fase 3 (queda 1 error preexistente en `components/ui/ReelCard.tsx`: `Instagram` no exportado por `lucide-react`, fuera de scope).
- [x] `npm run codegen` ejecutado contra el nuevo endpoint `https://cortinastudio.gainweb.site/graphql` — tipo `General` y `GetGeneralDocument` ya generados; `getGeneral.ts` refactorizado para usarlos.
- [x] Los fetchers retornan datos reales en una prueba manual (validado 2026-05-16 via route handler temporal `/api/debug/fetchers`).
  - `getProyectos` ✅ — 1 proyecto real con video (validado 2026-05-15).
  - `getGeneral` ✅ — whatsappNumber, brandName, navItems (parseo `nav_items_*` correcto, validado 2026-05-15).
  - `getHome` ✅ — `problems_cards` (4), `reels_selected` (3 IDs), `process_rotating_words` (4), `process_steps` (4) parsean limpio contra los schemas Zod. Validado 2026-05-16 tras corregir contenido en JetEngine segun `HOME-SINGLETON-CONTENIDO.md`.
    - **Pendiente no-bloqueante:** varios campos escalares del Home (`hero.eyebrow/title/imageCaption/...`, `problems.eyebrow/title/subtitle`, `reels.*`, `process.eyebrow/subtitle/ctaLabel`) aun contienen el nombre del campo como placeholder. Algunos typos en copy real (`hornod` → `horno`, `buttond` → `button`, `titlePrefixM` cortado, etc.). El cliente los corregira durante Fase 4 al editar contenido. No bloquea cierre del bullet ni de Fase 3.
  - **Bug corregido en motor (2026-05-15):** `wpFetch` recibia `GetXDocument.toString()` que produce `"[object Object]"` (los `Documents` son `DocumentNode` AST, no strings); `lib/wordpress/client.ts` ahora acepta `string | DocumentNode` y aplica `print()` de `graphql` para serializar.
  - **Mismatch motor vs spec resuelto:** `getHome.ts` exige `key` en `problemCardSchema` y `number` (1-4) en `processStepSchema`; se opto por agregar esos sub-campos en JetEngine (no se relajo el schema Zod). Decision documentada en `memoryLTS/memory_2026-05-15-2.md`.

---

## Fase 4 — Migracion del Home

> Estado: ✅ Codigo completo al 2026-05-16. Pendiente unica verificacion: prueba end-to-end del webhook (bullet final).
> **Hallazgos:**
> 1. El bridge devuelve attachment IDs crudos para campos Media de JetEngine. Workaround: nuevo fetcher `lib/wordpress/getMediaUrls.ts` que resuelve IDs a URLs via `mediaItems(where: { in: [...] })`. Centralizado en `page.tsx`. Solucion ideal pendiente: agregar tipo `media` al plugin `cortinastudio-wpgraphql-bridge`.
> 2. WPGraphQL solo popula `sourceUrl` para imagenes; para videos usar `mediaItemUrl`. La query `getMediaUrls.graphql` pide ambos y el fetcher cae primero en `mediaItemUrl`.
> 3. Cleanup colateral: removidos imports muertos en `components/ui/ReelCard.tsx` (`Link`, `motion`, `AnimatePresence`, `Instagram`, `Music2`) y typeo de `ease` en `FadeInStagger.tsx` (de `any` a tupla numerica). Eran preexistentes pero bloqueaban `next build`.

- [x] Convertir `app/[locale]/page.tsx` a RSC que llame `getHome()`, `getProyectos()` y `getGeneral()`. (Tambien `getMediaUrls()` para resolver attachments.)
- [x] Pasar datos por props a las secciones (`Hero`, `ProblemsSection`, `ReelsSection`, `ProcessSection`).
- [x] Actualizar los tipos de props de cada seccion para recibir datos desde WP (en lugar de los arrays hardcodeados). Tipos derivan de `HomeData[seccion]` para no duplicar.
- [x] Eliminar arrays hardcodeados: `REELS`, `PROBLEMS`, `STEPS` y cualquier constante de contenido del archivo. Iconos resueltos via nuevo helper `lib/iconMap.tsx` (registry unificado: Lucide names + slugs; `whatsapp` es SVG custom local).
- [x] Reemplazar `502XXXXXXXX` literal por `general.whatsappNumber` desde la query (Hero, ReelsSection y ProcessSection).
- [x] Verificar que el sitio se ve igual con datos reales de WP. (Confirmado por usuario 2026-05-16, incluido carrusel de videos tras fix de `mediaItemUrl`.)

### Cambios al motor en Fase 4

- `lib/iconMap.tsx` — nuevo helper de iconos (motor, no cliente).
- `lib/wordpress/getMediaUrls.ts` + `lib/graphql/queries/getMediaUrls.graphql` — resolucion de attachment IDs (motor).
- `lib/wordpress/getProyectos.ts` + query — agregado `databaseId` para hacer match con `reels.selected`.
- `lib/wordpress/tags.ts` — nuevo tag `wp:media` para cache.

### Verificacion Fase 4

- [x] `npx tsc --noEmit` — 0 errores.
- [x] `npm run lint` — sin errores.
- [x] `npm run build` — build exitoso con `.env.local` configurado; SSG de `/es` y `/en`.
- [x] El Home carga correctamente en `http://localhost:3000`.
- [~] Editar un campo en WP → guardar → el cambio se refleja en el frontend en < 5 segundos. Validado en `next dev` (refresh inmediato; dev no cachea fetches). Validacion estricta del webhook + `revalidateTag` solo aplica en `next start`/deploy y requiere tunel o sitio publicado — pendiente para Fase 5.

---

## Fase 5 — QA y replicacion

- [ ] Validar revalidacion en todos los CPTs: cambio en `home` invalida `wp:home`, cambio en `proyecto` invalida `wp:proyectos`, etc. *(Bloqueado por deploy/tunel — diferido hasta que el sitio este publicado.)*
- [ ] Validar fallback si WP esta caido: el sitio muestra `notFound()` o datos en cache; no crashea.
- [x] Validar que los iconos del Repeater `problems_cards` mapean correctamente a Lucide via `iconMap`. *(2026-05-16: los 8 nombres del CMS — `Thermometer`/`EyeOff`/`VolumeX`/`Sparkles` en `problems_cards` y `whatsapp`/`mappin`/`palette`/`wrench` en `process_steps` — resuelven contra el REGISTRY de `lib/iconMap.tsx`. Corregido mismatch en `wp-config.json.iconMap.process` que declaraba valores PascalCase no presentes en el CMS ni en el REGISTRY; ahora los valores reflejan los slugs lowercase reales.)*
- [~] Exportar setup de JetEngine (JetEngine → Tools → Export) y guardar el JSON en `recursos/` como plantilla de fabrica. *(2026-05-16: la accion de export la realiza el usuario en el panel WP; `recursos/README.md` documenta el procedimiento y el nombre/ubicacion esperados del archivo `jetengine-cortinastudio.json`.)*
- [x] Documentar el playbook de replicacion en `README.md` del proyecto: clonar → editar `wp-config.json` + `.env.local` → `npm run codegen` → deploy. *(2026-05-16: `README.md` reescrito completo — reglas no negociables, setup, scripts, estructura, playbook por fase y referencias a skills.)*
- [ ] Verificar que un segundo proyecto nuevo puede conectarse a otro WP solo editando `wp-config.json` y `.env.local`. *(Pendiente cliente real para probar end-to-end.)*

---

## Verificaciones tecnicas globales

- [ ] No se modifico ningun archivo de configuracion del cliente (`client-brief.json`, `tailwind.config.ts`, `messages/*.json`, `bridge-fields.json`) por razon arquitectonica — esos archivos solo cambian si el cliente cambia datos.
- [ ] No se instalo `@apollo/client`.
- [ ] No se usa `revalidatePath` en ningun lugar — solo `revalidateTag`.
- [ ] Los tags de cache son siempre las constantes de `tags.ts`, nunca strings sueltos.
- [ ] `npm run codegen` solo se ejecuto despues de tener `.env.local` con endpoint real y al menos una query en `lib/graphql/queries/`.
