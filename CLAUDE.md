# Guia Maestra — Fabrica de Sitios Premium (Cortina Studio Stack)

Este repo NO es un sitio. Es la **base estandar replicable** de una fabrica de sitios premium con Next.js 14 + WordPress headless. Cortina Studio fue el primer cliente; todo lo que esta aqui debe funcionar igual para los siguientes con cambios minimos y predecibles.

---

## 1. Lectura obligatoria (en este orden)

1. **`AGENTS.md`** — manual completo: stack, arquitectura, patrones de diseno premium, sistema de animacion, capa WordPress y checklist de replicacion. Leelo una vez por completo, despues vuelve solo a las secciones que necesites.
2. **`client-brief.json`** — identidad visual del cliente actual (paleta, tipografia, estructura). Es el unico input creativo.
3. **`wp-config.json`** — contrato de datos: slugs de CPT, nombres de meta fields, iconMap. Lo consume el frontend.
4. **`wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json`** — espejo de los meta fields en el lado WP. Debe coincidir 1:1 con la columna correspondiente de `wp-config.json`.

No leas `Plan/PLANv1.md` ni `Plan/PLANv2.md` salvo que el usuario lo pida explicitamente — son el historial de como se construyo la base, no instrucciones para nuevos clientes.

---

## 2. Lo que cambia por cliente vs lo que es estandar

**Cambia por cliente (solo estos archivos):**

| Archivo | Que define |
|---|---|
| `client-brief.json` | Paleta, tipografias, copies de seccion, estructura de paginas |
| `wp-config.json` | Endpoint del CMS, slugs de CPT, nombres de meta fields, iconMap |
| `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` | Lista de meta fields que el plugin expone a GraphQL (espejo de `wp-config.json.fields`) |
| `messages/{es,en}.json` | Strings de UI (eyebrows, labels, errores) |
| `tailwind.config.ts` | Tokens (colores + fontFamily) derivados del brief |
| `app/[locale]/page.tsx` y `components/sections/*` | Composicion concreta del cliente |
| `.env.local` | URL del CMS, secrets |

**NO cambia entre clientes:**

- `lib/wordpress/*` (cliente GraphQL + tags + config loader + barrel)
- `app/api/revalidate/route.ts` (endpoint de revalidacion por tags)
- `wordpress/plugins/cortinastudio-wpgraphql-bridge/cortinastudio-wpgraphql-bridge.php` (plugin PHP)
- `components/motion/*` (FadeIn, FadeInStagger)
- `components/ui/*` (primitivas reutilizables)
- `i18n/*`, `middleware.ts`
- Reglas de diseno premium (paddings, tipografia, easing, anatomia de seccion)

Si te ves obligado a tocar algo de la columna "no cambia", **PARA y avisa al usuario**. Cualquier cambio ahi rompe la promesa de fabrica y deberia subir a la base estandar para todos los proyectos.

---

## 3. Estado actual del repo

- **Fase 1 — Base de fabrica** [completa]: `lib/wordpress/`, `wp-config.json`, `/api/revalidate`, codegen y `.env.example`.
- **Fase 2 — Backend WordPress** [completa]: plugin `cortinastudio-wpgraphql-bridge` v3.0.0 instalado, CPTs (`proyectos`, `home-singleton`) expuestos a WPGraphQL, fields validados en GraphiQL.
- **Fase 3 — Queries y fetchers** [pendiente]: crear `.graphql` por seccion + `getHome()`, `getProyectos()` en `lib/wordpress/`, correr `npm run codegen`.
- **Fase 4 — Conectar componentes** [pendiente]: reemplazar arrays estaticos en `components/sections/*` por props que vengan de los fetchers.

Para cualquier cliente nuevo, las Fases 1 y 2 ya estan resueltas conceptualmente — la replicacion se concentra en personalizar los 3 archivos de la columna izquierda y ejecutar las Fases 3 y 4.

---

## 4. Reglas permanentes de trabajo

- Respondes en espanol, directo y tecnico. Si una decision del usuario es suboptima, lo dices y propones la alternativa antes de ejecutar.
- Antes de tocar codigo del frontend lee `AGENTS.md` (al menos las secciones 4, 5, 8 y 14).
- Antes de tocar el plugin PHP lee `AGENTS.md` seccion 14 — el plugin esta disenado para no necesitar cambios; si crees que necesita uno, plantealo primero.
- Verificacion despues de cualquier cambio significativo: `npx tsc --noEmit` + `npm run lint`. Si tocaste el grafo de datos, ademas `npm run codegen`.
- No commits sin que el usuario lo pida.
- No ejecutes `npm run codegen` hasta que exista `.env.local` con un endpoint real y al menos una query en `lib/graphql/queries/`.

---

## 5. Datos clave del proyecto actual

- CPTs en JetEngine: `proyectos`, `home-singleton`.
- Query names validados: `proyectos { nodes }` (tipo GraphQL `Proyecto`) y `homeSingletons { nodes }` (tipo `HomeSingleton`).
- Meta keys → camelCase automatico (`hero_title` → `heroTitle`, `video_poster` → `videoPoster`).
- Repeaters de JetEngine (`problems_cards`, `reels_selected`, `process_rotating_words`, `process_steps`) llegan al frontend como **JSON string**; se parsean en el fetcher.
- Plugin PHP fijo en v3.0.0; cualquier evolucion futura debe mantener compatibilidad con `bridge-fields.json` ya escrito.
