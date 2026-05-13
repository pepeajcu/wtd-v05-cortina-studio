# Estado Actual del Proyecto vs. Estándar de Fábrica

Este documento analiza el estado actual del desarrollo comparándolo con el estándar definido en `AGENTS.md` y los planes de ejecución (`PLANv1`, `PLANv2`).

## 1. Análisis de Cumplimiento (Estándar vs. Realidad)

### ✅ Lo que se ha implementado (Sincronizado)
- **Stack Tecnológico:** Se sigue estrictamente Next.js 14 (App Router), TypeScript estricto, Tailwind CSS y Framer Motion.
- **Infraestructura Base (Fase 1):**
  - `wp-config.json` y `.env.example` establecidos como fuente de verdad.
  - Cliente `wpFetch` implementado en `lib/wordpress/client.ts` usando `fetch` nativo para integración con el caché de Next.js.
  - Sistema de revalidación por tags implementado en `app/api/revalidate/route.ts`.
  - Configuración de `graphql-codegen` lista para generar tipos.
- **Exposición de Datos (Fase 2):**
  - Plugin `cortinastudio-wpgraphql-bridge` creado e instalado en WordPress.
  - CPTs `proyectos` y `home-singleton` expuestos exitosamente en el schema de WPGraphQL.
  - Registro de meta fields (escalares y repeaters) validado mediante pruebas reales con posts en WordPress.
  - Implementación de repeaters como JSON strings para parseo en el frontend.

### ⚠️ Lo que ha cambiado o ya no aplica
- **Módulo de Integración de JetEngine:** El plan original (`PLANv1`) sugería activar un módulo interno de JetEngine. `MemoriaFase2.md` confirma que dicho módulo no es viable/existente en versiones recientes, validando la decisión de desarrollar el plugin propio `cortinastudio-wpgraphql-bridge`.
- **Enfoque del Plugin Bridge:** El plugin actual contiene CPTs y campos hardcodeados. El usuario ha identificado esto como un anti-patrón para la "Fábrica". Se requiere evolucionar el plugin hacia una versión **Universal** que auto-descubra la configuración de JetEngine desde la base de datos.

### ❌ Lo que falta por hacer (Pendientes)
- **Capa de Datos (Fase 3):**
  - Escribir queries `.graphql` específicas por dominio en `lib/graphql/queries/`.
  - Ejecutar `npm run codegen` para generar los tipos TypeScript finales.
  - Implementar los fetchers tipados (`getHome.ts`, `getProyectos.ts`, `getGeneral.ts`) en `lib/wordpress/`.
- **Integración de UI (Fase 4):**
  - Migrar los componentes de `components/sections/` para que consuman datos de los fetchers en lugar de arrays estáticos.
  - Eliminar los datos hardcoded de las secciones.
- **Configuración Final:**
  - Setup de `.env.local` con credenciales reales.
  - Configuración final de webhooks salientes en WordPress para revalidación automática.
  - Implementación de la página de opciones "General" (JetEngine Options Page).
- **Verificación Final:**
  - Ejecución de `npm run lint` y `npx tsc --noEmit` en todo el proyecto.
  - Validación de `npm run build` exitoso.

---

## 2. Rol de las Skills en el Proyecto

En la carpeta `.opencode` se encuentran instaladas diversas skills de diseño avanzado:
- `stitch-design-taste`
- `minimalist-ui`
- `high-end-visual-design`
- `design-taste-frontend`

### Importancia Vital:
Estas skills no son herramientas de código, sino **guías de criterio estético**. Son la implementación técnica de la sección "Design Conventions (Premium Standard)" de `AGENTS.md`. 

Su función es asegurar que el resultado final no sea solo un "sitio que funciona", sino un producto **Premium** mediante:
1. **Refinamiento Tipográfico:** Aplicación de tracking negativo en headings y jerarquías dramáticas.
2. **Control de Espaciado:** Garantizar que el whitespace sea generoso (`py-24 lg:py-32`), evitando el aspecto "barato" de sitios genéricos.
3. **Micro-interacciones:** Uso del easing premium `[0.22, 1, 0.36, 1]` en todas las animaciones de Framer Motion.
4. **Consistencia Visual:** Asegurar que los tokens de `client-brief.json` se traduzcan en una interfaz coherente y minimalista.

Sin estas skills, el proyecto cumpliría la funcionalidad técnica pero fallaría en la promesa de valor de la "Fábrica de Sitios Premium".
