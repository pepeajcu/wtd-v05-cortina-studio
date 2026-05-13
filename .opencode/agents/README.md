# `.claude/agents/` — Subagentes especializados

Esta carpeta aloja **subagentes** que pueden invocarse via la herramienta `Agent` con `subagent_type: <name>`. Cada subagente es un archivo `<name>.md` con frontmatter YAML.

Se materializa un subagente solo cuando aparece un workflow real que lo justifica. **No inventamos subagentes especulativos** — el inventario crece con el uso, no por anticipado.

---

## Cuando crear un subagente

Crea un subagente solo si la tarea cumple **al menos dos** de:

1. Es repetitiva (se hace en multiples sesiones).
2. Necesita un set acotado de herramientas (no todas).
3. Tiene un disparador claro (un tipo de archivo, un comando, una frase del usuario).
4. Se beneficia de aislar contexto del hilo principal (ej. no contaminar la conversacion principal con resultados de busquedas masivas).

Si no cumple, ejecuta la tarea directamente desde el hilo principal.

---

## Esqueleto de un subagente

```markdown
---
name: nombre-del-subagente
description: |
  Cuando usar este subagente. Triggers explicitos. Que NO debe hacer.
tools: Read, Grep, Glob, WebFetch
model: sonnet
---

# Nombre del subagente

Instrucciones detalladas: rol, comportamiento, formato de salida esperado, limites de scope.

## Que SI hacer
- ...

## Que NO hacer
- ...

## Formato de respuesta
- ...
```

**Campos del frontmatter:**

| Campo | Obligatorio | Notas |
|---|---|---|
| `name` | si | kebab-case, mismo que el nombre del archivo sin `.md` |
| `description` | si | Define cuando se invoca. Cuanto mas especifica, mejor seleccion automatica |
| `tools` | no | Lista de herramientas permitidas. Por defecto hereda del padre |
| `model` | no | `haiku` / `sonnet` / `opus`. Por defecto hereda |

---

## Catalogo actual

(Vacio. Se llenara cuando aparezcan workflows que justifiquen subagentes especializados — ej. `wp-graphql-validator`, `client-brief-bootstrapper`, `revalidation-debugger`.)
