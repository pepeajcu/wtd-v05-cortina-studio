# 002 — Fabrica Autoguiada: orquestador de replicacion y destilado de la experiencia Cortina

> Spec Driven Development (SDD). Esta es la **especificacion**: el *que* y el *por que*. El *como* paso a paso vive en `task.md`.

> **STATUS 2026-05-25 — aprobado, en ejecucion.** Origen: conversacion estrategica recogida en `ULTIMA-CONVERSACION.md` (raiz del repo). Ajustes P1-P4 aplicados el 2026-05-25; ejecucion fase por fase con OK del usuario entre fases.

---

## 1. Problema

El motor de la fabrica funciona de punta a punta con Cortina Studio (Fases 1-4 del plan `001-plan-inicial` cerradas; modelo de 3 tiers aplicado el 2026-05-18). Pero el repo tiene **las piezas, no la experiencia guiada**. Hoy, si un dev —o el propio autor dentro de 6 meses— clona el repo para levantar un cliente nuevo, se encuentra con estos huecos:

1. **No hay un punto de entrada unico.** El `README` tira al playbook por fase y la skill `replicacion-cliente` tiene el checklist, pero nada *ejecuta* el flujo ni dice "empieza aqui, ahora carga esta skill, valida esto antes de seguir". El orden de ejecucion entre skills es conocimiento tribal, no esta prescrito.

2. **No hay orquestador.** Las skills de dominio (`arquitectura-fabrica`, `diseno-fabrica`, `data-layer`, `wordpress-bridge`, `i18n-fabrica`) son conocimiento granular sin director de obra que las encadene en el orden correcto con compuertas de validacion.

3. **Lecciones criticas de Cortina viven como narrativa, no como reglas del motor.** Hallazgos que costaron sesiones enteras descubrir estan solo en `docs/specs/001-plan-inicial/task.md` (notas de fase) y en `memoryLTS/`, no en las skills que un cliente nuevo cargaria. Si la skill no lo dice, el proximo cliente vuelve a tropezar con lo mismo.

4. **No hay plantilla de progreso por cliente.** `docs/specs/001-plan-inicial/task.md` es el tracker de Cortina, pero no existe una version reutilizable que se copie al arrancar un cliente nuevo para llevar su estado de avance.

5. **No hay criterio objetivo de "fabrica lista vs evolucion del motor".** La regla actual es "si te obliga a tocar X, para y avisa", pero es cualitativa. Falta un test/checklist concreto para decidir, sin ambiguedad, si un cambio es parche de cliente o evolucion de la base.

## 2. Objetivo

Convertir el repo de **"funciona para Cortina"** a **"fabrica sistematica y autoguiada, lista para levantar el siguiente cliente sin sorpresas"**. Concretamente: que invocar una sola skill arranque un flujo interactivo que guie el levantamiento de cero a publicado, cargando las skills correctas en orden, validando cada compuerta antes de avanzar, y apoyandose en un motor que ya tiene destilada toda la experiencia de Cortina Studio.

El entregable no es Cortina; Cortina es el prototipo que destila la fabrica. El entregable es **el motor + el conocimiento operativo ejecutable para clonar el siguiente cliente**.

## 3. Decisiones de alcance (cerradas con el usuario, 2026-05-25)

Estas tres decisiones determinan la forma del plan. Se documentan para que cualquier lectura futura entienda el porque.

| # | Decision | Eleccion | Implicacion |
|---|---|---|---|
| 1 | Formato de la guia | **Skill orquestadora interactiva** (sin documento estatico aparte) | El punto de entrada es invocar la skill `nuevo-cliente`. No se crea un `START-HERE.md`; la discoverability vive en la tabla de skills de `CLAUDE.md`/`AGENTS.md` y en el `README`. |
| 2 | Audiencia | **Solo para mi** (el autor dentro de 6 meses) | Explicitud moderada: la skill puede asumir familiaridad con el stack. No se invierte en troubleshooting exhaustivo para devs externos. |
| 3 | Cortina Studio en el repo | **Se queda como ejemplo vivo** | El repo es "motor + cliente de referencia". Cero trabajo de extraccion. Cortina ocupa los slots como ejemplo funcional; las skills siguen hablando de "el cliente en `client-brief.json`", no de "Cortina". |

## 4. Principios de diseno

1. **Orquestador delgado, no monolito.** `nuevo-cliente` es un **director de obra**: posee la *secuencia*, las *compuertas* y el *bootstrap del tracker*. No duplica el contenido de las skills de dominio ni de `replicacion-cliente` — las carga y delega. Coherente con la arquitectura de contrato delgado ya adoptada en la fabrica.
2. **Una skill = una responsabilidad.** `replicacion-cliente` sigue siendo el *contrato* (que cambia por cliente, reglas de oro). `nuevo-cliente` es el *flujo ejecutable* que hace cumplir ese contrato. Sin solapamiento de contenido.
3. **Compuertas explicitas entre fases.** Cada paso del flujo termina en una validacion verificable (`tsc`, `lint`, query en GraphiQL, webhook que llega). No se avanza con la anterior a medias.
4. **El conocimiento que costo descubrirse vive en el motor, no en la bitacora.** Toda leccion de Cortina con valor para el proximo cliente se promueve de `memoryLTS`/`task.md` a la skill de dominio correspondiente. `memoryLTS` queda como traza historica, no como fuente operativa.
5. **El estado de cada cliente es un artefacto copiable.** Arrancar un cliente nuevo crea su propio `task.md` desde una plantilla, igual que `001-plan-inicial` fue el de Cortina.
6. **Sistematizar es estrictamente aditivo.** Este plan es documental y de organizacion (skills, plantillas, punteros). NO ejecuta, NO modifica y NO elimina nada del trabajo del cliente activo. Distilar lecciones = leer el codigo de Cortina + escribir en skills del motor; jamas borrar campos, correr su codegen ni retirar sus archivos.
7. **Cortina no esta terminado; sus pendientes se conservan, no se cierran.** Cortina Studio sigue siendo un proyecto en curso al 2026-05-25. Todo pendiente suyo (limpieza JetEngine, validacion webhook, deudas de Footer, etc.) se mantiene PENDIENTE y se traza en un backlog por cliente — nunca se ejecuta ni se elimina como efecto colateral de ordenar la fabrica.

## 5. Arquitectura propuesta

### 5.1 Skill orquestadora `nuevo-cliente` (entregable principal)

```
.claude/skills/nuevo-cliente/SKILL.md       # nueva — el director de obra
.opencode/skills/nuevo-cliente/SKILL.md     # espejo byte-a-byte
```

Responsabilidades exclusivas de la orquestadora (lo que NINGUNA otra skill hace):

- **Bootstrap:** al arrancar, copia las plantillas de progreso (5.3) — `task.md` y `pendientes.md` — a `docs/specs/NNN-<cliente>/` y registra el cliente. Convencion de nombre: `NNN-<cliente>` (correlativo de tres digitos + slug del cliente); Cortina queda como `001-plan-inicial` por historia.
- **Secuencia con compuertas:** Fase 0 (brief) → 1 (frontend) → 2 (backend WP) → 3 (conexion) → 4 (migracion) → 5 (QA/publicacion). Por cada fase: *que skill cargar*, *que hacer*, *que compuerta pasar antes de avanzar*.
- **Delegacion:** "ahora carga `diseno-fabrica` y selecciona familia segun `vibe`", "ahora carga `wordpress-bridge` para el naming GraphQL", etc. El contenido vive en esas skills; la orquestadora solo indica el cuando.
- **Puntos de pausa:** marca los hitos donde se espera aprobacion humana explicita (p.ej. layout antes de secciones internas).

La orquestadora es **corta**. Si crece con contenido de dominio, ese contenido va a la skill de dominio, no a ella.

### 5.2 Destilado de la experiencia Cortina → skills de dominio

Promover los hallazgos que hoy solo viven en `task.md`/`memoryLTS` a la skill que un cliente nuevo cargaria. Detalle en la seccion 6.

### 5.3 Plantillas por cliente

```
docs/specs/_plantilla-cliente/task.md         # nueva — checklist generico Fase 0-5
docs/specs/_plantilla-cliente/pendientes.md   # nueva — backlog vivo del cliente
```

Prefijo `_` para que ordenen aparte de los specs numerados y se lean como plantilla, no como un cliente real. Se crean **juntas y antes de la orquestadora** (son su insumo: la orquestadora las copia al arrancar).

- `task.md`: espejo abstracto de `001-plan-inicial/task.md` sin datos de Cortina — cajas verificables por fase con huecos a rellenar (`<cliente>`, `<dominio>`, `<cpt>`). **Instancia que APUNTA a la orquestadora y a las skills; no reexplica el como** (ver §7).
- `pendientes.md`: backlog vivo de deudas, bloqueos por infra y notado-fuera-de-alcance. Concepto detallado en §5.6.

### 5.4 Criterio objetivo "fabrica lista vs evolucion del motor"

Un test concreto (no cualitativo) que vive como nueva seccion en `replicacion-cliente`. Borrador del test:

> Un cambio es **parche de cliente** (permitido) solo si toca exclusivamente archivos de la columna izquierda del contrato (`client-brief.json`, `messages/*`, `wp-config.json`, `bridge-fields.json`, `tailwind.config.ts`, `app/[locale]/page.tsx`, `components/sections/*`, `.env.local`). Si toca cualquier otro archivo, es **evolucion del motor**: PARA, discutelo, versiona el cambio para TODOS los clientes y deja commit explicito.

Mas dos preguntas de desempate para casos grises (p.ej. un componente nuevo en `components/ui/`): ¿lo necesitaria cualquier cliente futuro? → motor. ¿es composicion concreta de este cliente? → cliente.

### 5.5 Discoverability (sin documento estatico)

- Añadir `nuevo-cliente` a la tabla de skills de `CLAUDE.md` **y** `AGENTS.md` (mirror obligatorio, regla critica del repo) con trigger "EMPIEZA AQUI para levantar un cliente nuevo".
- Añadir una linea en el `README` (seccion playbook) que apunte a invocar la skill como primer paso.

### 5.6 Espacio de pendientes por cliente (Cortina incluido, sin tocarlo)

Cortina no esta terminado y este plan NO cierra su deuda — la **traza**. Se establece una convencion de backlog por cliente que servira a todos los clientes futuros:

```
docs/specs/<cliente-spec>/pendientes.md      # backlog vivo del cliente
docs/specs/_plantilla-cliente/pendientes.md  # plantilla (se crea en §5.3 junto al task.md)
```

Diferencia con `task.md`: `task.md` es el checklist lineal de fases del levantamiento; `pendientes.md` es el backlog vivo de deudas, bloqueos por infra y cosas notadas-fuera-de-alcance. Para Cortina, `pendientes.md` **consolida** sus items abiertos (hoy dispersos en `001-plan-inicial/task.md` Fase 5 y en `memoryLTS/`) en un solo lugar, **todos en estado pendiente, ninguno ejecutado ni borrado**:

- Limpieza de campos JetEngine migrados a JSON (`recursos/LIMPIEZA_WP_CORTINA.md` se conserva como la lista accionable).
- `npm run codegen` tras esa limpieza (dependiente de lo anterior).
- Validacion end-to-end del webhook (`revalidateTag`) — bloqueada por deploy/tunel.
- Validacion de fallback con WP caido.
- Segundo cliente real para probar replicacion.
- Deuda: Footer hardcodea telefono/email/social icons; deberia leer de `getGeneral()`.
- `hero_image_caption` monolingue en WP (trade-off acotado; revisar si `/en` se ve raro).
- `recursos/ESTADO_PROYECTO_*.md` posiblemente stale tras el refactor de 3 tiers — **revisar/actualizar, no borrar**.

`LIMPIEZA_WP_CORTINA.md` y los `ESTADO_PROYECTO_*.md` **no se eliminan**: son material del proyecto Cortina que aun hace falta.

## 6. Lecciones de Cortina a destilar (mapa hallazgo → destino)

| Hallazgo (hoy en task.md / memoryLTS) | Destino (skill del motor) | Por que es load-bearing |
|---|---|---|
| El bridge devuelve **attachment IDs crudos** para campos Media de JetEngine; se resuelven con el fetcher `getMediaUrls.ts` (`mediaItems(where: { in: [...] })`), centralizado en `page.tsx` | `data-layer` (patron) + `wordpress-bridge` (causa raiz + TODO de agregar tipo `media` al plugin) | Todo cliente con imagenes/video desde WP lo necesita; sin esto, el dev ve IDs numericos en vez de URLs y no sabe por que |
| WPGraphQL solo popula `sourceUrl` para **imagenes**; para **video** usar `mediaItemUrl` (el fetcher pide ambos y cae primero en `mediaItemUrl`) | `data-layer` + `wordpress-bridge` | Carrusel de video roto sin esto; costo una sesion descubrirlo |
| Repeaters de **Options Page** llegan como **object indexado `item-N`** con keys prefijadas por slug (`nav_items_*`) y orden por `nav_items_order`; helper `parseRepeater` tolerante a array plano u object indexado | `data-layer` (hoy solo dice "repeater = JSON string", que es la forma de CPT, no de Options) | Shape distinto al de CPT; sin el helper, el parseo Zod falla silenciosamente |
| `reels_selected` (relaciones a otro CPT): usar **Repeater + sub-campo `id` tipo Posts**; el bridge solo lee `post_meta`, las relaciones JetEngine viven aparte | `wordpress-bridge` | Modela como conectar CPTs entre si — necesario para cualquier "destacados/seleccionados" |
| `wpFetch` acepta `string \| DocumentNode` y aplica `print()` (los Documents del codegen son AST, no strings) | `data-layer` (nota breve; ya esta en el codigo del motor) | Evita el bug `"[object Object]"` si alguien refactoriza el client |

Hallazgo descartado por obsolescencia: el fix de `iconMap` (slugs lowercase vs PascalCase) quedo sin objeto tras el refactor de 3 tiers, que movio las constantes estructurales al componente y elimino el `iconMap` de `wp-config.json`. No se destila.

## 7. Frontera con lo existente (que NO se duplica)

La secuencia de levantamiento de un cliente NO se describe tres veces. Ownership unico por artefacto:

| Artefacto | Posee | NO hace |
|---|---|---|
| `replicacion-cliente` | El **contrato**: tabla de archivos que cambian por cliente, reglas de oro, criterio motor-vs-cliente | No es un checklist para tildar paso a paso; cede el "orden de ejecucion" a la orquestadora |
| `nuevo-cliente` (orquestadora) | El **flujo ejecutable**: secuencia, compuertas, que skill cargar cuando, bootstrap del tracker | No copia el contrato ni el contenido de las skills de dominio |
| `_plantilla-cliente/task.md` | La **instancia de progreso** por cliente: cajas que se marcan | No reexplica el como; cada caja APUNTA a la orquestadora / a la skill correspondiente |

- **Skills de dominio:** la orquestadora las invoca por nombre; el conocimiento sigue viviendo en ellas. Se enriquecen (seccion 6) pero no se mueven.
- **`memoryLTS`:** se conserva intacto como traza historica. El destilado *copia* el conocimiento operativo a las skills; no borra la bitacora.
- **Consecuencia para Fase 2:** al añadir el criterio motor-vs-cliente a `replicacion-cliente`, revisar que su §3 (checklist) no duplique el flujo de la orquestadora. Si hay solape, `replicacion-cliente` cede el paso-a-paso al orquestador y conserva solo el contrato.

## 8. Beneficios esperados

- **Arranque sin ambiguedad:** invocar una skill y dejarse guiar fase por fase, con compuertas que impiden avanzar a medias.
- **Cero re-tropiezo:** las trampas que costaron sesiones (attachments crudos, video vs imagen, repeater de Options) ya estan en la skill que el cliente nuevo carga.
- **Estado por cliente trazable:** cada cliente tiene su `task.md`, igual que Cortina.
- **Decision motor-vs-cliente objetiva:** un test concreto reemplaza el juicio caso a caso.
- **Pendientes visibles por cliente:** el backlog de Cortina (y de cualquier cliente futuro) queda en un solo lugar, sin perderse ni mezclarse con el checklist de fases — y sin tocar el trabajo en curso.

## 9. Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| La orquestadora se infla con contenido de dominio y duplica skills | Principio de orquestador delgado (4.1); revision: si un parrafo describe *como* hacer algo de un dominio, va a la skill de dominio |
| `CLAUDE.md` y `AGENTS.md` se desincronizan al añadir la skill | Mirror obligatorio en el mismo cambio + `Compare-Object` de verificacion (regla critica del repo) |
| El destilado introduce contradicciones entre skill y codigo real | Cada hallazgo destilado se verifica contra el codigo actual (`getMediaUrls.ts`, `getGeneral.ts`, `client.ts`) antes de escribirlo en la skill |
| Ordenar la fabrica termina ejecutando o borrando trabajo pendiente de Cortina | Principio 6 y 7 (aditivo): el plan solo LEE el codigo de Cortina; sus pendientes se trazan en `pendientes.md`, nunca se ejecutan ni se eliminan aqui |
| La plantilla de cliente se desactualiza respecto al flujo real | La orquestadora y la plantilla (`task.md` + `pendientes.md`) comparten la misma estructura de fases; cualquier cambio de fase toca ambas en el mismo PR |

## 10. Lo que este plan NO toca

- El codigo de aplicacion del motor (`lib/wordpress/{config,client,tags,index}.ts`, `app/api/revalidate/`, `components/motion/`, plugin PHP). Solo se enriquecen las skills que lo documentan.
- **Nada del proyecto Cortina.** No se ejecuta su limpieza de JetEngine, no se corre su codegen, no se borran sus archivos (`recursos/LIMPIEZA_WP_CORTINA.md`, `ESTADO_PROYECTO_*.md`), no se toca su contenido. Sus pendientes solo se *consolidan y trazan* en `pendientes.md`.
- La extraccion de Cortina a otro repo (decision 3: se queda como ejemplo vivo).
- Un documento `START-HERE.md` estatico (decision 1: la orquestadora es el punto de entrada).
- Las skills de terceros bajo `taste-design/`.
