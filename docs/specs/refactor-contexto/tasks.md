# Tasks — Refactor de Contexto

> Checklist verificable. Cada caja se marca a medida que se ejecuta. Las fases son secuenciales: NO empezar Fase 2 hasta que el usuario apruebe el plan.

---

## Fase 1 — Spec (esta carpeta)

- [x] Crear `docs/specs/refactor-contexto/proposal.md` con diseno modular y separacion fabrica vs Cortina Studio.
- [x] Crear `docs/specs/refactor-contexto/tasks.md` (este archivo).

## Hito de aprobacion

- [x] Mostrar plan resumido al usuario.
- [x] Esperar OK explicito antes de tocar archivos fuera de `docs/specs/`.

## Fase 2 — Refactor de contexto y skills

### 2.1 CLAUDE.md minimo

- [x] Reescribir `CLAUDE.md` (≤60 lineas) con SOLO:
  - Identidad del repo (fabrica replicable, no un sitio).
  - Idioma de respuesta y tono.
  - Comandos universales (`tsc`, `lint`, `codegen`).
  - Reglas globales: no commits sin pedir, separacion fabrica vs cliente.
  - Indice de skills disponibles bajo `.claude/skills/` con trigger de cada una.
- [x] Verificar que ya no contiene reglas exclusivas de Cortina Studio (slugs CPT, query names del cliente, datos del CMS).
- [x] Verificar que ya no duplica el contenido del antiguo `AGENTS.md`.

### 2.2 Skills modulares (motor de fabrica)

- [x] Crear `.claude/skills/arquitectura-fabrica/SKILL.md` con secciones: stack, renderizado, estructura de carpetas, reglas de codigo, performance.
- [x] Crear `.claude/skills/wordpress-bridge/SKILL.md` con: plugin propio, bridge-fields.json, naming GraphQL, codegen, problemas conocidos.
- [x] Crear `.claude/skills/data-layer/SKILL.md` con: lib/wordpress, queries, fetchers tipados, Zod en repeaters, revalidacion por tags.
- [x] Crear `.claude/skills/i18n-fabrica/SKILL.md` con: next-intl, layouts, patron labels delegadas, namespaces.
- [x] Crear `.claude/skills/replicacion-cliente/SKILL.md` con: checklist Fase 1-4 y reglas de oro de la fabrica.
- [x] Cada skill arranca con frontmatter YAML estandar (`name`, `description`, opcional `model` si aplica).
- [x] Cada skill termina con seccion "Lo que NO debes hacer" relevante a su dominio.

### 2.3 Skill diseno-fabrica

- [x] Crear `.claude/skills/diseno-fabrica/SKILL.md` extrayendo de AGENTS.md: design tokens, layout, section blueprint, typography, animations, components, accesibilidad, globals.css, checklist premium.
- [x] Anadir bloque obligatorio al final que indique: *"Antes de proponer cualquier UI o token, lee tambien `.claude/skills/taste-design/`. Las reglas de la fabrica son el suelo; taste-design es el referente de altura."*
- [x] Verificar que las reglas estan formuladas en abstracto (no "el cliente Cortina usa #1A1A1A" sino "los colores los define `client-brief.json`").

### 2.4 Subagentes

- [x] Verificar `.claude/agents/`. Si esta vacio, dejar un `README.md` corto explicando para que sirve y un esqueleto de subagente con YAML frontmatter (`name`, `description`, `tools`, `model`) como ejemplo.

### 2.5 Eliminar AGENTS.md

- [x] Despues de migrar todo el contenido y verificar que las skills cubren las 21 secciones, eliminar `AGENTS.md` del root.
- [x] Actualizar cualquier referencia a `AGENTS.md` en el codigo (grep) hacia el skill correspondiente.

## Fase 3 — Sistema de memoria LTS

- [x] Crear directorio `memoryLTS/` en la raiz del proyecto.
- [x] Crear `memoryLTS/memory.md` (indice) con encabezado + linea de la sesion actual.
- [x] Crear `memoryLTS/memory_2026-05-13-1.md` documentando ESTE refactor (frontmatter + secciones: que se hizo, decisiones, pendientes, archivos tocados).
- [x] La descripcion en `memory.md` que apunta a `memory_2026-05-13-1.md` debe ser ≤140 caracteres y resumir el refactor entero.
- [x] Crear `.claude/skills/save-session-memory/SKILL.md` con instrucciones de como ejecutar `/save-session-memory`: leer sesion, calcular fecha y N, escribir archivo, prepender linea al indice, reportar.

## Fase 4 — Ejecucion y verificacion

- [x] A medida que se ejecutan los pasos, marcar las casillas en este archivo (`Edit` con `[ ]` → `[x]`).
- [x] Al final, lanzar `Glob` para confirmar que todos los archivos esperados existen.
- [x] Reportar al usuario:
  - Lineas eliminadas del CLAUDE.md anterior.
  - Skills creadas con su `description` resumido.
  - Ruta del primer snapshot LTS.
  - Comando para invocar `/save-session-memory` en sesiones futuras.

## Verificaciones tecnicas

- [x] No se modifico ningun archivo bajo `app/`, `components/`, `lib/`, `wordpress/plugins/` ni archivos de cliente (`client-brief.json`, `wp-config.json`, `bridge-fields.json`, `messages/*`). Refactor 100% documental — `npx tsc --noEmit` y `npm run lint` no se ven afectados.
