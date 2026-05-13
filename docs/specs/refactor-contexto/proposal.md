# Refactor de Contexto — Fabrica de Sitios + Cortina Studio

> Spec Driven Development (SDD). Esta es la **especificacion** del refactor: el *que* y el *por que*. El *como* paso a paso vive en `tasks.md`.

---

## 1. Problema

Hoy el repo carga ~1.700 lineas de manual (`AGENTS.md`) + un `CLAUDE.md` indice en **cada** invocacion de Claude Code. Esto:

1. **Quema tokens** por sesion (la mayoria de tareas no tocan el plugin PHP, ni la capa de animacion, ni el endpoint de revalidacion — pero igual viajan en contexto).
2. **Mezcla dos niveles** que deben estar separados: el **motor de la fabrica** (replicable a N clientes) y la **implementacion de Cortina Studio** (un cliente concreto).
3. **No tiene memoria entre sesiones**. Cada conversacion arranca en frio; las decisiones, los aprendizajes y los snapshots de avance se pierden si no se commitean a mano.
4. **Acopla diseno y arquitectura** dentro del mismo manual gigante, pese a que son ejes ortogonales (la arquitectura es WP+Next; el diseno es premium-estandar).

## 2. Principios del refactor

1. **Carga perezosa por skill.** Solo se cargan en contexto las secciones del manual que la tarea actual exige. Las skills son la unidad atomica de conocimiento.
2. **Separacion estricta motor vs cliente.** Cualquier regla, color o copy exclusivo de Cortina Studio NO vive en archivos globales (`CLAUDE.md`, skills de la fabrica). Vive en archivos del cliente (`client-brief.json`, `wp-config.json`, `messages/*.json`, `bridge-fields.json`).
3. **Memoria de largo plazo (LTS) explicita.** Cada sesion relevante deja un snapshot fechado en `memoryLTS/` con un indice tipo tweet (≤140 caracteres) para escaneo rapido en sesiones futuras.
4. **`CLAUDE.md` minimo.** Solo lo que necesita TODA sesion sin excepcion: identidad del repo, regla de respuesta en espanol, comandos de verificacion, puntero a skills.
5. **Spec antes que codigo.** Este documento + `tasks.md` se escriben primero. La ejecucion sigue el checklist verificable; cada paso completado se marca.

## 3. Diseno modular propuesto

### 3.1 Capa global (carga siempre)

```
CLAUDE.md                          # ~50 lineas — identidad, idioma, comandos, puntero a skills
```

Contenido permitido:
- Identidad del repo (es una **fabrica**, no un sitio).
- Idioma de respuesta (espanol, directo, tecnico).
- Comandos universales: `npx tsc --noEmit`, `npm run lint`, `npm run codegen` (con la condicion de cuando usarlo).
- Reglas que aplican a TODA sesion: no commits sin pedir, separacion fabrica vs cliente, donde encontrar el resto.

Contenido **prohibido** en `CLAUDE.md` global:
- Reglas de diseno premium (paddings, easing, anatomia de seccion).
- Detalles del plugin PHP, slugs de CPT, query names, meta keys.
- Datos del cliente actual (Cortina Studio).
- Cualquier cosa que solo sea relevante en una sub-tarea concreta.

### 3.2 Capa skills (carga bajo demanda)

```
.claude/skills/
├── arquitectura-fabrica/SKILL.md      # Stack, estructura de carpetas, fases de la fabrica
├── wordpress-bridge/SKILL.md          # Plugin PHP, bridge-fields.json, GraphQL naming, codegen
├── data-layer/SKILL.md                # lib/wordpress, queries, fetchers, Zod, revalidacion
├── i18n-fabrica/SKILL.md              # next-intl, patron labels delegadas, namespaces
├── diseno-fabrica/SKILL.md            # Reglas premium universales + puntero OBLIGATORIO a taste-design/
├── replicacion-cliente/SKILL.md       # Checklist Fase 1-4 para levantar un cliente nuevo
├── save-session-memory/SKILL.md       # Comando /save-session-memory — escribe snapshot LTS
└── taste-design/                      # (ya existe) — referencia visual base, no se toca
    ├── design-taste-frontend/
    ├── high-end-visual-design/
    ├── minimalist-ui/
    └── ...
```

**Regla clave de `diseno-fabrica`:** su `SKILL.md` debe terminar con un bloque obligatorio que diga *"Antes de proponer cualquier UI o token, lee tambien `.claude/skills/taste-design/`. Las reglas de la fabrica son el suelo; taste-design es el referente de altura."*

### 3.3 Capa cliente (cambia por proyecto, NO en skills)

```
client-brief.json                                         # Paleta, tipografia, copies del cliente actual
wp-config.json                                            # Endpoint, slugs CPT, meta keys, iconMap del cliente
messages/{es,en}.json                                     # Strings UI del cliente
tailwind.config.ts                                        # Tokens derivados del brief
wordpress/plugins/.../bridge-fields.json                  # Mirror de los meta keys del cliente
app/[locale]/page.tsx, components/sections/*              # Composicion concreta del cliente
.env.local                                                # Secretos del entorno del cliente
```

**Cortina Studio es solo el ocupante actual de estos slots.** Las skills NO conocen "Cortina Studio"; conocen "el cliente que esta en `client-brief.json`".

### 3.4 Capa memoria (historico entre sesiones)

```
memoryLTS/
├── memory.md                       # Indice. Cada linea = un snapshot fechado + descripcion ≤140 chars
└── memory_YYYY-MM-DD-N.md          # Un archivo por sesion relevante (N=1,2,... si hay varias el mismo dia)
```

`memory.md` se escanea de un vistazo. Los archivos individuales se leen solo cuando la descripcion sugiere que son pertinentes a la tarea actual.

### 3.5 Capa subagentes (opcional)

```
.claude/agents/
└── (vacio por ahora, se llena cuando aparezca un workflow que justifique un subagente especializado)
```

Los subagentes que se creen vivan aqui con YAML frontmatter (`name`, `description`, `tools`, `model`). No se inventan subagentes especulativos; solo se materializan cuando el workflow real lo pide.

## 4. Mapeo: AGENTS.md actual → destino

| Seccion AGENTS.md actual                     | Destino propuesto                              |
|----------------------------------------------|------------------------------------------------|
| 1. Rol y mision                              | `CLAUDE.md` (1 parrafo) + `arquitectura-fabrica` |
| 2. Stack tecnologico                         | `arquitectura-fabrica/SKILL.md`                |
| 3. Estrategia de renderizado                 | `arquitectura-fabrica/SKILL.md`                |
| 4. Estructura de carpetas                    | `arquitectura-fabrica/SKILL.md`                |
| 5. Reglas de codigo                          | `arquitectura-fabrica/SKILL.md`                |
| 6. Design tokens (Tailwind)                  | `diseno-fabrica/SKILL.md`                      |
| 7. Layout patterns (Container/Header/Footer) | `diseno-fabrica/SKILL.md`                      |
| 8. Section patterns (Blueprint)              | `diseno-fabrica/SKILL.md`                      |
| 9. Typography patterns                       | `diseno-fabrica/SKILL.md`                      |
| 10. Animation system                         | `diseno-fabrica/SKILL.md`                      |
| 11. Component patterns                       | `diseno-fabrica/SKILL.md`                      |
| 12. Data architecture                        | `data-layer/SKILL.md`                          |
| 13. i18n                                     | `i18n-fabrica/SKILL.md`                        |
| 14. Integracion WordPress                    | `wordpress-bridge/SKILL.md`                    |
| 15. Accesibilidad                            | `diseno-fabrica/SKILL.md` (apartado A11y)      |
| 16. Performance checklist                    | `arquitectura-fabrica/SKILL.md`                |
| 17. globals.css                              | `diseno-fabrica/SKILL.md`                      |
| 18. Flujo de trabajo paso a paso             | `replicacion-cliente/SKILL.md`                 |
| 19. Lo que NO debes hacer                    | Repartido entre las skills relevantes          |
| 20. Comunicacion                             | `CLAUDE.md` (queda en global)                  |
| 21. Replicacion a cliente nuevo              | `replicacion-cliente/SKILL.md`                 |
| Apendice A: Checklist calidad premium        | `diseno-fabrica/SKILL.md` (final)              |

Una vez todo migrado, `AGENTS.md` queda **eliminado** del root. Si en el futuro hace falta un equivalente para otros runners (opencode, etc.), se genera por composicion automatica de las skills, no por mantener un duplicado a mano.

## 5. Separacion fabrica vs Cortina Studio — checklist

Cada bloque que migre debe pasar este filtro antes de quedar fijado en una skill global:

- [ ] ¿Esto es cierto para CUALQUIER cliente futuro? Si no → no va en skill global, va en archivos de cliente.
- [ ] ¿Menciona "Cortina Studio", el dominio del cliente, sus colores especificos, sus copies? Si si → reescribir en abstracto o mover a archivos de cliente.
- [ ] Los EJEMPLOS pueden citar Cortina Studio (es el primer cliente, util como caso real), pero la REGLA debe estar formulada en abstracto: *"el cliente X define... el cliente Cortina Studio definio..."*

## 6. Sistema de memoria LTS — diseno

### 6.1 Estructura de cada `memory_YYYY-MM-DD-N.md`

```markdown
---
date: YYYY-MM-DD
session: N
tags: [refactor, wordpress, diseno, ...]
summary: <≤140 chars — exacto lo que va al indice>
---

# Sesion YYYY-MM-DD #N — <titulo corto>

## Que se hizo
- bullets

## Decisiones tomadas
- bullets con el por que

## Pendientes / siguientes pasos
- bullets

## Archivos tocados
- ruta1
- ruta2
```

### 6.2 Estructura de `memory.md`

```markdown
# MemoryLTS — Indice de sesiones

> Una linea por sesion. La descripcion es estrictamente ≤140 caracteres (tweet).

- [2026-05-13 #1](./memory_2026-05-13-1.md) — Refactor de contexto: split CLAUDE.md/AGENTS.md en skills, creacion de memoryLTS y skill save-session-memory.
```

### 6.3 Skill `save-session-memory`

Comando: `/save-session-memory`

Comportamiento:
1. Lee la conversacion actual.
2. Identifica: que se hizo, decisiones, pendientes, archivos tocados.
3. Calcula la fecha de hoy y el siguiente N libre del dia.
4. Escribe `memoryLTS/memory_YYYY-MM-DD-N.md` con el frontmatter + estructura definida arriba.
5. Construye una descripcion ≤140 caracteres del trabajo y la prepende como nueva linea al final del bloque de items en `memory.md`.
6. Reporta al usuario: ruta del archivo creado + linea agregada al indice.

## 7. Beneficios esperados

- **Tokens por sesion ↓ ~70%** en tareas que no tocan diseno o WP (la mayoria de bugfixes y conexion de datos).
- **Onboarding de cliente nuevo:** clonar repo + reemplazar 5 archivos cliente + leer `replicacion-cliente/SKILL.md`. Cero ambiguedad sobre "que es estandar y que es Cortina".
- **Trazabilidad:** `memoryLTS/memory.md` da una vista cronologica del proyecto sin tener que leer git log.
- **Evolucion controlada:** un cambio en el motor (ej. nueva regla de diseno premium) toca una skill — todas las sesiones futuras la heredan; ningun cliente queda atras.

## 8. Riesgos y mitigaciones

| Riesgo                                                       | Mitigacion                                                            |
|--------------------------------------------------------------|-----------------------------------------------------------------------|
| Una skill no se carga cuando se necesita y Claude improvisa  | `CLAUDE.md` lista las skills disponibles con su trigger explicito     |
| Duplicacion de info entre skills (mismo bloque en 2 lugares) | Tabla de mapeo de la Seccion 4 — cada bloque tiene UN destino unico  |
| `memoryLTS/` crece sin control                               | Indice ≤140 chars filtra; archivos individuales solo se leen si aplica |
| Reglas de Cortina Studio se filtran a skills globales        | Filtro de la Seccion 5 + revision en cada PR que toque skills         |

## 9. Lo que este refactor NO toca

- Codigo de aplicacion (`app/`, `components/`, `lib/`, `wordpress/plugins/`).
- Configuracion del cliente actual (`client-brief.json`, `wp-config.json`, `bridge-fields.json`, `messages/*`).
- Plugin PHP `cortinastudio-wpgraphql-bridge`.
- Skills de terceros bajo `.claude/skills/taste-design/` y `.opencode/skills/taste-design/`.

Este refactor es **puramente documental y de organizacion de contexto**. Cero cambios funcionales en el sitio.
