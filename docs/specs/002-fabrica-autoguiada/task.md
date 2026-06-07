# Tasks — 002 Fabrica Autoguiada

> Checklist verificable. Cada caja se marca a medida que se ejecuta. Las fases son secuenciales: NO empezar una fase hasta que la anterior este completa y el usuario la apruebe. El *que* y el *por que* estan en `proposal.md`.

> **Regla critica que atraviesa todo el plan:** cualquier edicion en `CLAUDE.md` se replica byte-a-byte en `AGENTS.md` (y viceversa) en el mismo cambio. Verificar con `Compare-Object (Get-Content CLAUDE.md) (Get-Content AGENTS.md)` (debe salir vacio). Igual para `.claude/skills/` ↔ `.opencode/skills/`.

> **Principio aditivo (no negociable):** este plan ordena el MOTOR. Cortina Studio no esta terminado; nada suyo se ejecuta, modifica ni elimina aqui. Distilar lecciones = leer su codigo + escribir en skills. Sus pendientes se TRAZAN (Fase 6), nunca se cierran ni se borran como efecto de ordenar la fabrica.

---

## Fase 0 — Spec (esta carpeta)

- [x] Crear `docs/specs/002-fabrica-autoguiada/proposal.md`.
- [x] Crear `docs/specs/002-fabrica-autoguiada/task.md` (este archivo).

## Hito de aprobacion

- [x] Mostrar plan resumido al usuario (2026-05-25).
- [x] Esperar OK explicito antes de ejecutar Fase 1. **Aprobado 2026-05-25** (hoja de decisiones P1-P6: ajustes aplicados, ejecucion completa fase por fase).

---

## Fase 1 — Destilar la experiencia de Cortina en el motor

> Promueve los hallazgos que hoy solo viven en `docs/specs/001-plan-inicial/task.md` y `memoryLTS/` a la skill de dominio que un cliente nuevo cargaria. Mapa completo en `proposal.md` seccion 6. Cada hallazgo se VERIFICA contra el codigo actual antes de escribirlo en la skill.

### 1.1 Patrones de media → `data-layer` + `wordpress-bridge`

- [x] Verificar contra `lib/wordpress/getMediaUrls.ts` y `lib/graphql/queries/getMediaUrls.graphql` el patron real antes de documentarlo.
- [x] En `data-layer`: añadir seccion "Resolucion de assets de WP" — el bridge devuelve attachment IDs crudos para campos Media; resolverlos via fetcher `getMediaUrls.ts` (`mediaItems(where: { in: [...] })`), centralizado en el RSC. *(§5.2)*
- [x] En `data-layer`: documentar que WPGraphQL popula `sourceUrl` solo para imagenes; para video usar `mediaItemUrl`. La query pide ambos; el fetcher resuelve `mediaItemUrl ?? sourceUrl`.
- [x] En `wordpress-bridge`: registrar la causa raiz (el plugin no resuelve Media a URL) + el TODO de agregar un tipo `media` al plugin `cortinastudio-wpgraphql-bridge` como solucion ideal futura.

### 1.2 Forma de repeaters → `data-layer`

- [x] Verificar contra `lib/wordpress/getGeneral.ts` y `getHome.ts` el shape real y el helper `parseRepeater`. *(Hallazgo: `getGeneral.ts` ya no tiene `navItems` tras el refactor 3 tiers; `parseRepeater` sigue vivo en `getHome.ts` con `reels_selected`.)*
- [x] En `data-layer`: precisar que hay DOS formas de repeater — CPT (array/JSON string) y Options Page (object indexado `item-N` con keys prefijadas por slug). `parseRepeater` documentado como helper tolerante a ambas. El `item-N` se documenta como motivo historico del helper, no como ejemplo vivo (para no contradecir el codigo). *(§5.1)*

### 1.3 Relaciones entre CPTs → `wordpress-bridge`

- [x] En `wordpress-bridge`: documentar el patron `reels_selected` — relaciones a otro CPT se modelan como Repeater + sub-campo `id` tipo Posts; el bridge solo lee `post_meta`, las relaciones JetEngine viven aparte. *(Limitacion #2)*

### 1.4 Serializacion de queries → `data-layer`

- [x] En `data-layer`: nota breve de que `wpFetch` acepta `string | DocumentNode` y aplica `print()` (los Documents del codegen son AST). Verificado contra `lib/wordpress/client.ts`. *(§1)*

### 1.5 Espejo OpenCode

- [x] Replicar cada edicion de `.claude/skills/{data-layer,wordpress-bridge}/SKILL.md` en `.opencode/skills/...`.
- [x] `Compare-Object` por cada par de archivos editados — salida vacia (ambos).

### 1.6 Verificacion Fase 1

- [x] Ningun hallazgo documentado contradice el codigo actual del motor (verificado contra `getMediaUrls.ts`, `getHome.ts`, `client.ts`, `getMediaUrls.graphql`).
- [x] Las skills editadas siguen siendo "contrato delgado": el destilado son reglas/patrones, no tutoriales de Cortina.
- [x] `memoryLTS/` queda intacto (el destilado copia, no mueve). `git status` confirma: solo 4 skills modificadas, cero archivos de Cortina.

---

## Fase 2 — Criterio objetivo motor-vs-cliente → `replicacion-cliente`

> Reemplaza la regla cualitativa "si te obliga a tocar X, para" por un test concreto. Detalle del borrador en `proposal.md` seccion 5.4.

- [x] Añadir a `replicacion-cliente` una seccion "Test: ¿parche de cliente o evolucion del motor?" con la regla binaria (toca solo la columna izquierda del contrato → cliente; toca cualquier otra cosa → motor) + las 2 preguntas de desempate para casos grises. *(Al final de §2.)*
- [x] Verificar que la lista de "archivos que cambian por cliente" en el test coincide exactamente con la tabla existente de la seccion 1 de la skill (sin divergencia). *(El test APUNTA a la tabla §1 — fuente unica; se añadio `.env.local` como fila 7 para completarla, ya que estaba en el checklist pero no en la tabla.)*
- [~] Revisar que la §3 (checklist) de `replicacion-cliente` no duplique el flujo de la orquestadora (Fase 4): si hay solape, ceder el paso-a-paso al orquestador y conservar solo el contrato (ver `proposal.md` §7). *(Banner de ownership añadido al inicio de §3 cediendo el paso-a-paso a `nuevo-cliente`. La poda estructural real se hace en Fase 4, cuando la orquestadora exista y se vea el solape concreto.)*
- [x] Espejo en `.opencode/skills/replicacion-cliente/SKILL.md` + `Compare-Object` vacio.

---

## Fase 3 — Plantillas por cliente

> Ambas plantillas se crean JUNTAS y ANTES de la orquestadora (Fase 4), que las copia en su bootstrap. Ver `proposal.md` secciones 5.3 y 7.

### 3.1 Plantilla de checklist

- [x] Crear `docs/specs/_plantilla-cliente/task.md`: espejo abstracto de `001-plan-inicial/task.md` con cajas por Fase 0-5, compuertas, y huecos `<cliente>`/`<dominio>`/`<cpt>` a rellenar. Sin datos de Cortina.
- [x] **Instancia que APUNTA, no reexplica:** cada fase encabeza con la skill que carga y referencia secciones (`data-layer` §5.1/§5.2, `replicacion-cliente` §1/§2, `wordpress-bridge` §1/§4); no reescribe el "como".

### 3.2 Plantilla de backlog

- [x] Crear `docs/specs/_plantilla-cliente/pendientes.md` — backlog con 4 secciones (deudas tecnicas, bloqueos por infra, fuera-de-alcance, mejoras de motor detectadas) para que cada cliente nazca con su backlog.

### 3.3 Coherencia

- [x] Las fases de la plantilla coinciden 1:1 con las fases del flujo de la orquestadora (4.2): Brief(0) → Frontend(1) → Backend WP(2) → Conexion(3) → Migracion(4) → QA/publicacion(5), con la misma compuerta por fase y el hito de aprobacion de layout en Fase 1.
- [x] Diferencia explicita en el header de ambos archivos: `task.md` = checklist lineal de fases; `pendientes.md` = backlog vivo.

---

## Fase 4 — Skill orquestadora `nuevo-cliente`

> El entregable principal. Director de obra delgado: secuencia + compuertas + bootstrap del tracker. NO duplica contenido de las skills de dominio ni de `replicacion-cliente`. Consume las plantillas de Fase 3. Ver `proposal.md` secciones 5.1 y 7.

### 4.1 Estructura de la skill

- [x] Crear `.claude/skills/nuevo-cliente/SKILL.md` con frontmatter (`name`, `description` con trigger "EMPIEZA AQUI para levantar un cliente nuevo"). *(Registrada y visible en la lista de skills del runner.)*
- [x] Definir el bootstrap (Paso 0): al arrancar, preguntar `<cliente>`/`<dominio>`, calcular `NNN` libre, copiar `docs/specs/_plantilla-cliente/{task.md,pendientes.md}` a `docs/specs/NNN-<cliente>/` y rellenar huecos.

### 4.2 Flujo con compuertas

- [x] Documentada la secuencia Fase 0→5 con (a) skill a cargar, (b) que hacer en una linea, (c) compuerta verificable, para las 6 fases.
- [x] Puntos de pausa con aprobacion humana marcados (Fase 1: layout aprobado antes de secciones internas).
- [x] Punteros explicitos a `replicacion-cliente` (contrato) y a secciones de skills (`data-layer` §5.1/§5.2), sin copiar su contenido.

### 4.3 Verificacion de delgadez

- [x] Releida: una linea "Haz" por fase, sin reexplicar el "como" de ningun dominio (se carga la skill).
- [x] La skill no menciona "Cortina" como regla.

### 4.4 Espejo OpenCode

- [x] Crear `.opencode/skills/nuevo-cliente/SKILL.md` identico + `Compare-Object` vacio.

---

## Fase 5 — Discoverability (sin documento estatico)

- [x] Añadir `nuevo-cliente` a la tabla de skills de `CLAUDE.md` con su trigger ("EMPIEZA AQUI..."). Reformulada la fila de `replicacion-cliente` a "contrato" para que no se lean como duplicados.
- [x] Replicar identico en `AGENTS.md`. `Compare-Object (Get-Content CLAUDE.md) (Get-Content AGENTS.md)` → vacio.
- [x] Añadir en `README.md` (seccion playbook) la linea de entrada apuntando a invocar `nuevo-cliente`.
- [x] Confirmar que `replicacion-cliente` y `nuevo-cliente` se referencian mutuamente: banner de ownership en `replicacion-cliente` §3 (→ orquestadora) + cuerpo de `nuevo-cliente` (carga el contrato en Fase 0).

---

## Fase 6 — Backlog de Cortina (trazar, sin tocar)

> NO cierra la deuda de Cortina: la TRAZA en su `pendientes.md`, usando la convencion establecida en Fase 3. Cero ejecucion, cero borrado. Ver `proposal.md` seccion 5.6.

- [x] Crear `docs/specs/001-plan-inicial/pendientes.md` recogiendo los items abiertos de Cortina, todos PENDIENTES, sin ejecutar ninguno (4 secciones: deudas tecnicas, bloqueos por infra, fuera-de-alcance, mejoras de motor).
- [x] Verificar que NINGUN item del backlog se ejecuto ni se elimino archivo alguno de Cortina. `git status` + `ls recursos/`: los 4 archivos de `recursos/` intactos; cero cambios en `wp-config.json`/`bridge-fields.json`/`messages/*`/`components/*`/`lib/`.
- [x] En `001-plan-inicial/task.md`, puntero a `pendientes.md` añadido (banner al inicio). No se reescribio ninguna caja existente de Cortina.

---

## Fase 7 — Smoke test del sistema autoguiado

> Prueba que la orquestadora realmente guia. La validacion definitiva es un segundo cliente real; mientras no exista, un dry-run acota el riesgo.

- [x] Dry-run en `docs/specs/_scratch-dryrun/`: bootstrap OK (plantillas copiadas, `<cliente>`/`<dominio>` rellenados). Recorrido del flujo: las 6 skills referenciadas (`replicacion-cliente`, `diseno-fabrica` + 3 familias `taste-design`, `i18n-fabrica`, `wordpress-bridge`, `data-layer`) + `motion-calm-preset.md` EXISTEN. Compuertas concretas y verificables; secuencia coherente con dependencias hacia adelante.
- [x] Carpeta scratch eliminada; `docs/specs/` limpio (sin clientes de prueba).
- [x] Ajustar la orquestadora segun el dry-run: **sin ajustes necesarios**, el recorrido paso limpio (ningun orden confuso, compuerta ambigua ni skill faltante).
- [~] (Cuando exista cliente real) Levantar un segundo cliente end-to-end siguiendo solo la orquestadora. **Diferido:** no hay cliente real aun; trazado en `001-plan-inicial/pendientes.md` (validacion de fabrica).

---

## Verificaciones tecnicas globales

- [x] `CLAUDE.md` y `AGENTS.md` identicos byte-a-byte tras Fase 5 (`Compare-Object` vacio).
- [x] Cada par `.claude/skills/X` ↔ `.opencode/skills/X` editado queda identico (data-layer, wordpress-bridge, replicacion-cliente, nuevo-cliente — todos `Compare-Object` vacio).
- [x] La orquestadora no duplica contenido de skills de dominio ni de `replicacion-cliente`.
- [x] Ningun cambio de este plan toca codigo de aplicacion del motor ni ejecuta procesos del cliente (sin `codegen`, sin borrados).
- [x] **Cero archivos de Cortina modificados o eliminados.** `git status` no muestra cambios en `wp-config.json`, `bridge-fields.json`, `messages/*`, `components/sections/*`, `recursos/*` ni `lib/`; los 4 archivos de `recursos/` confirmados intactos.
- [x] `memoryLTS/` intacto; el destilado copio conocimiento a skills, no lo movio.
