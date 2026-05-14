# CLAUDE.md / AGENTS.md — Indice global

Este repo es la **base estandar replicable** de una fabrica de sitios premium (Next.js 14 + WordPress headless). NO es un sitio. El cliente actual ocupando los slots de configuracion es Cortina Studio; cualquier futuro cliente reemplaza esos archivos sin tocar el motor.

---

## Espejo `CLAUDE.md` ↔ `AGENTS.md` (regla critica)

`CLAUDE.md` (Claude Code) y `AGENTS.md` (OpenCode, Cursor y otros runners que no leen `CLAUDE.md`) son **el mismo documento**. Reglas no negociables:

- Deben mantenerse **identicos byte-a-byte** en todo momento. La unica diferencia permitida es el nombre del archivo.
- **Cualquier edicion en uno se replica en el otro en el mismo cambio.** Si editas solo uno, el repo queda en estado invalido.
- **Toda referencia en el repo a `CLAUDE.md` aplica tambien a `AGENTS.md` (y viceversa).** Si una skill, doc, spec o comentario dice "actualiza `CLAUDE.md`" o "consulta `CLAUDE.md`", debes hacerlo en ambos archivos. Esto vale aunque la referencia diga solo uno de los dos nombres.
- Razon: el runner activo determina cual de los dos archivos se carga en contexto. Mantenerlos identicos garantiza que el agente (sea cual sea) opere bajo las mismas reglas.
- Verificacion rapida tras editar: `Compare-Object (Get-Content CLAUDE.md) (Get-Content AGENTS.md)` (PowerShell) o `diff CLAUDE.md AGENTS.md` (bash). El resultado debe estar vacio.

---

## Reglas globales (aplican a TODA sesion)

- Responde en **espanol**, directo y tecnico. Si una decision del usuario es suboptima, dilo y propon la alternativa antes de ejecutar.
- **No commits sin que el usuario lo pida.**
- **Separacion estricta motor vs cliente.** Lo que cambia por cliente vive solo en: `client-brief.json`, `wp-config.json`, `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json`, `messages/{es,en}.json`, `tailwind.config.ts`, `app/[locale]/page.tsx`, `components/sections/*`, `.env.local`. Si un cambio te obliga a tocar otra cosa **PARA y avisa** — es evolucion del motor, no parche del cliente.
- Cortina Studio es el cliente actual de ejemplo. Sus colores, copies y datos NO son reglas globales; son contenido de los archivos de cliente.

## Verificacion despues de cualquier cambio significativo

- `npx tsc --noEmit`
- `npm run lint`
- Si tocaste el grafo de datos: `npm run codegen` (requiere `.env.local` con endpoint real y al menos una query en `lib/graphql/queries/`).

## Skills disponibles bajo `.claude/skills/`

Carga la skill cuando el trigger aplique a la tarea actual. No cargues skills "por si acaso".

| Skill | Cuando usarla |
|---|---|
| `arquitectura-fabrica` | Estructura de carpetas, stack, RSC vs client, reglas de TypeScript/Tailwind, performance |
| `diseno-fabrica` | UI, tokens, layout, secciones, tipografia, animaciones, componentes, accesibilidad. **Esta skill exige consultar `.claude/skills/taste-design/` antes de proponer UI** |
| `wordpress-bridge` | Plugin propio, `bridge-fields.json`, naming GraphQL, codegen, problemas conocidos |
| `data-layer` | `lib/wordpress/`, queries, fetchers tipados, Zod en repeaters, revalidacion por tags |
| `i18n-fabrica` | next-intl, layouts, namespaces, patron labels delegadas |
| `replicacion-cliente` | Levantar un cliente nuevo (Fase 1-4) y reglas de oro de la fabrica |
| `save-session-memory` | Comando `/save-session-memory` — escribe snapshot de la sesion en `memoryLTS/` |
| `taste-design/` | Skills de referencia visual de terceros (lectura cuando `diseno-fabrica` lo indica) |

## Memoria entre sesiones

`memoryLTS/memory.md` es el indice cronologico de sesiones relevantes. Cada linea apunta a un archivo `memory_YYYY-MM-DD-N.md` con un resumen ≤140 caracteres. Lee el indice cuando el usuario referencie trabajo previo o cuando necesites contexto historico antes de decidir.

## Lo que NO debes leer salvo peticion explicita

- `Plan/PLANv1.md`, `Plan/PLANv2.md` — historial de construccion del motor, no son instrucciones para nuevos clientes.
- `docs/specs/*` — especificaciones cerradas; consulta solo si el usuario lo pide.
