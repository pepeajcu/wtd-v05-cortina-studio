# Pendientes — Cortina Studio: backlog

> Backlog vivo de Cortina Studio (cliente ocupante de los slots, **proyecto en curso**), distinto de `task.md`: aqui van deudas, bloqueos por infra y cosas notadas-fuera-de-alcance que NO son parte del checklist lineal de fases.
> **Todos los items estan PENDIENTES.** Este archivo solo los CONSOLIDA (creado en Fase 6 del plan `002-fabrica-autoguiada`); no se ejecuto ni se elimino nada. Se cierran solo cuando se resuelven, no al "ordenar la fabrica".
> Formato por item: `- descripcion · estado · nota`.

---

## Deudas tecnicas

- **Limpieza JetEngine** — borrar los meta fields de copy migrados a `messages/{es,en}.json` (22 escalares + 4 repeaters en `home-singleton`; 6 escalares + 1 repeater en Options `general`). · pendiente · accion manual del usuario en el panel WP; lista exacta en `recursos/LIMPIEZA_WP_CORTINA.md` (se conserva hasta completar).
- **`npm run codegen` post-limpieza** — regenerar `lib/graphql/generated/index.ts` para que el schema refleje solo Tier B/C. · pendiente · bloqueado-por: limpieza JetEngine.
- **Footer hardcodeado** — `tel:+502XXXXXXXX`, email `info@cortinastudio.com.gt` y social icons (Circle/Square/Triangle) literales; deberian leer de `getGeneral()`. · pendiente · deuda separada notada en el refactor de 3 tiers.
- **`hero_image_caption` monolingue en WP** — acoplado a la imagen que edita el cliente. · pendiente · revisar si en `/en` se ve raro; si molesta, mover a `messages/`.
- **`recursos/ESTADO_PROYECTO_{Claude,Opencode}.md` posiblemente stale** tras el refactor de 3 tiers. · pendiente · revisar/actualizar. **No borrar.**

## Bloqueos por infraestructura

- **Validacion end-to-end del webhook** (`revalidateTag`): editar post en WP → `POST /api/revalidate` → pagina actualizada en segundos sin redeploy; validar por tag en cada CPT/Options. · bloqueado-por: deploy/tunel (`next start` o sitio publicado; `next dev` no cachea fetches).
- **Validacion de fallback con WP caido**: el sitio sirve cache stale o `notFound()` controlado, no crashea. · bloqueado-por: entorno de prueba donde se pueda detener el WP.

## Fuera de alcance (notado, no abordado)

- **Segundo cliente real para probar replicacion end-to-end** — es validacion de la *fabrica*, no de Cortina. · pendiente · vive como Fase 7 (smoke test) en `docs/specs/002-fabrica-autoguiada/task.md`.

## Mejoras de motor detectadas desde este cliente

> Si aplica a TODOS los clientes, NO se parchea solo en Cortina: es **evolucion del motor** (ver `replicacion-cliente` §2).

- **Tipo `media` en el plugin `cortinastudio-wpgraphql-bridge`** que resuelva el attachment ID → URL en el backend, eliminando el segundo fetch `getMediaUrls`. · pendiente · evolucion del motor; subir `CSB_VERSION` y aplicar a todos los clientes (ver `wordpress-bridge` "Limitaciones conocidas").
- **Locales hardcodeados en el motor** — la lista de locales esta repetida a mano en `middleware.ts`, `i18n/request.ts` y `generateStaticParams` de `app/[locale]/layout.tsx`, en vez de leerse de `wp-config.json.locales.supported` (que ya existe). Cambiar de idiomas deberia ser solo config de cliente. · pendiente · evolucion del motor (mejora aditiva); detectado al reducir Cortina a `es` el 2026-05-27. Hoy un cliente multi-idioma obliga a tocar 3 archivos del motor.
