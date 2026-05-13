---
name: save-session-memory
description: Comando /save-session-memory. Genera un snapshot fechado de la sesion actual en memoryLTS/memory_YYYY-MM-DD-N.md, prepende una linea de <=140 caracteres al indice memoryLTS/memory.md y reporta al usuario las rutas creadas. Cargar cuando el usuario escriba `/save-session-memory` o pida explicitamente "guardar la sesion en memoria".
---

# /save-session-memory

Comando para persistir un resumen estructurado de la conversacion actual al sistema de memoria de largo plazo (`memoryLTS/`).

---

## Cuando invocar este flujo

- El usuario escribe `/save-session-memory` (con o sin texto adicional como tema o titulo).
- El usuario dice "guarda la sesion", "guardamela en memoryLTS", "haz un snapshot de esto".
- Al final de una sesion larga donde se tomaron decisiones no triviales que conviene preservar.

**No** invocar este flujo automaticamente al cierre de cada respuesta. Solo cuando hay senal explicita o cuando el contenido de la sesion claramente merece quedar registrado (refactors grandes, decisiones arquitectonicas, debugging de bugs duros, levantamiento de un cliente nuevo).

---

## Procedimiento (paso a paso)

### 1. Lee la sesion actual

Identifica:
- **Que se hizo** — acciones concretas, comandos ejecutados, archivos creados/modificados/eliminados.
- **Que decisiones se tomaron** — y por que (la razon es lo que importa, no solo el resultado).
- **Pendientes** — cosas que quedaron a medias, follow-ups, validaciones para la proxima sesion.
- **Archivos tocados** — lista exhaustiva, separados en creados / modificados / eliminados.

### 2. Calcula la fecha y el siguiente N libre del dia

- Fecha en formato `YYYY-MM-DD` (zona horaria del usuario).
- Lista los archivos en `memoryLTS/` que coincidan con `memory_YYYY-MM-DD-*.md`. Si hay 0, N=1; si hay 1, N=2; etc.
- Nombre del archivo: `memoryLTS/memory_YYYY-MM-DD-N.md`.

### 3. Escribe el archivo de sesion

Estructura obligatoria:

```markdown
---
date: YYYY-MM-DD
session: N
tags: [tag1, tag2, ...]              # 3-6 tags en kebab-case
summary: <texto exacto que ira al indice — <=140 caracteres>
---

# Sesion YYYY-MM-DD #N — <titulo corto>

## Contexto previo
<1-3 parrafos: en que estado estaba el repo / la tarea antes de empezar>

## Que se hizo
- bullets accionables, primer verbo en pasado o sustantivo de accion

## Decisiones tomadas
- bullets con el QUE y el POR QUE

## Pendientes / siguientes pasos
- bullets

## Archivos tocados

**Creados:**
- ruta1
- ruta2

**Modificados:**
- ruta3

**Eliminados:**
- ruta4

**No tocados (verificacion explicita):**
- (opcional, util cuando el cambio prometia ser invasivo y se mantuvo el alcance)
```

**Reglas del contenido:**

- Escribe en espanol, directo y tecnico.
- El campo `summary` del frontmatter y la linea del indice deben ser **identicos** y respetar el limite de 140 caracteres (cuenta los espacios; si te pasas, recorta).
- Los `tags` describen el dominio funcional (refactor, wordpress, diseno, i18n, codegen, plugin, ux, accesibilidad, etc.).
- Si hubo decisiones controversiales o que sorprendieron, dales una linea explicita en "Decisiones tomadas" — la razon es lo que vale para sesiones futuras.
- Pendientes solo si quedo algo abierto. No inventes pendientes.

### 4. Actualiza `memoryLTS/memory.md`

- Lee el archivo actual.
- Anade una linea NUEVA al final del bloque de items, con el formato:

```
- [YYYY-MM-DD #N](./memory_YYYY-MM-DD-N.md) — <summary identico al frontmatter>
```

- No elimines lineas existentes.
- Verifica que el conteo de caracteres del `summary` sea <=140 antes de escribir.

### 5. Reporta al usuario

Mensaje breve con:
- Ruta del archivo creado (clickable: `memoryLTS/memory_YYYY-MM-DD-N.md`).
- La linea exacta agregada al indice.
- Conteo de caracteres del summary (para confirmar que cumple).

Ejemplo de reporte:

```
Snapshot guardado:
  memoryLTS/memory_2026-05-13-1.md

Linea agregada al indice (138/140 chars):
  - [2026-05-13 #1](./memory_2026-05-13-1.md) — Refactor SDD: split AGENTS.md en skills...
```

---

## Lo que NO debes hacer

- Sobrescribir un `memory_YYYY-MM-DD-N.md` existente. Si N ya existe, incrementa N.
- Reescribir `memory.md` completo (puedes perder entradas historicas). Solo prepende/anade.
- Pasarte de 140 caracteres en el summary. Si no cabe, recorta sustantivos no esenciales.
- Documentar la sesion como "exitosa" sin reflejar pendientes reales — la honestidad tecnica es lo que hace util la memoria a futuro.
- Crear un snapshot por cada respuesta. Solo cuando hay senal del usuario o la sesion tuvo peso real.
- Modificar archivos fuera de `memoryLTS/` (esta skill solo escribe en esa carpeta).
