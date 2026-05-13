---
name: wordpress-bridge
description: Plugin propio cortinastudio-wpgraphql-bridge, bridge-fields.json, naming GraphQL derivado del slug, codegen, webhooks salientes y problemas conocidos del backend WordPress. Cargar cuando la tarea toque el plugin PHP, los meta fields de JetEngine, los nombres de tipos GraphQL o el pipeline de codegen.
---

# Integracion WordPress — Stack Estandar Validado

Esta skill describe **el stack WP exacto** que la fabrica usa. No es flexible: cada cliente nuevo debe quedar con esta misma configuracion para que el plugin propio, `wp-config.json`, los fetchers y el endpoint de revalidacion funcionen sin sorpresas.

---

## 1. Plugins requeridos en WP

| Plugin | Rol | Fuente |
|---|---|---|
| **WPGraphQL** | Capa GraphQL nativa | wordpress.org (gratis) |
| **JetEngine** | CPTs + meta fields (scalar y repeater) | Crocoblock (licencia) |
| **`cortinastudio-wpgraphql-bridge`** | Expone CPTs y meta de JetEngine a WPGraphQL sin tocar `functions.php` | Plugin propio en `wordpress/plugins/` de este repo |
| **Rank Math** | SEO con integracion GraphQL nativa | wordpress.org (gratis) |
| **WP Webhooks** (Cozmoslabs) | Webhook saliente al guardar posts | wordpress.org (gratis) |

**Plugins prohibidos (decisiones de fabrica):**
- `WPGraphQL SEO` (de Ash Hitchcock) — descontinuado.
- `Yoast SEO` — su integracion GraphQL solo esta en la version Premium.
- `Gato GraphQL` — no compatible con nuestro stack basado en `WPGraphQL` + `wpFetch`.
- `JetEngine WPGraphQL Integration` — no existe como modulo nativo en JetEngine 3.8+. El puente lo da nuestro plugin propio.

---

## 2. Plugin propio `cortinastudio-wpgraphql-bridge`

Vive en `wordpress/plugins/cortinastudio-wpgraphql-bridge/`. Se compone de **dos archivos**:

- `cortinastudio-wpgraphql-bridge.php` — el codigo PHP. **Nunca cambia entre clientes.**
- `bridge-fields.json` — la lista de meta fields a exponer. **Cambia por cliente** (mirror de `wp-config.json.fields`).

### Como funciona

1. **CPTs (Bloque 1, lista negra):** filtra `register_post_type_args`. Cualquier CPT que no este en la lista negra (`post`, `page`, `attachment`, internos de JetEngine/WPGraphQL/Yoast/RankMath) se expone automaticamente con `show_in_graphql = true`. No hace falta tocar functions.php por cada cliente.

2. **Naming GraphQL (regla de slug):** cuando los labels del CPT son ambiguos o iguales (caso comun en JetEngine), el plugin deriva los nombres GraphQL desde el slug:
   - Slug termina en `s` → `slug` es plural; `slug` sin la `s` final es singular.
     `proyectos` → query `proyectos`, tipo `Proyecto`.
   - Slug NO termina en `s` → `slug` es singular; `slug + 's'` es plural.
     `home-singleton` → query `homeSingletons`, tipo `HomeSingleton`.
   - kebab-case y snake_case se convierten automaticamente a camelCase.

3. **Meta fields (Bloque 2):** lee `bridge-fields.json` y registra cada meta key con `register_graphql_field` sobre el tipo correspondiente:
   - **`scalar`** → tipo GraphQL `String`. Resolver hace `get_post_meta(...)` y devuelve string o null.
   - **`repeater`** → tipo GraphQL `String`. Resolver devuelve `wp_json_encode(...)` del array. **El frontend hace `JSON.parse` y valida con Zod** (ver `data-layer`).
   - Naming: `hero_title` → `heroTitle`, `video_poster` → `videoPoster`. Conversion automatica.

4. **Panel admin:** en `Settings → WPGraphQL Bridge` el plugin muestra el estado, escanea posts existentes y sugiere un template de `bridge-fields.json` listo para copiar.

### Estructura de `bridge-fields.json`

```json
{
  "<post_type_slug>": {
    "scalar":   ["meta_key_1", "meta_key_2"],
    "repeater": ["meta_key_repeater_1"]
  }
}
```

**Regla de oro (MIRROR OBLIGATORIO):** lo que aparece como meta_key en `bridge-fields.json` debe aparecer (en camelCase) bajo `wp-config.json.fields.<cpt>.*`. Si no, el frontend pedira un campo que el backend no expone, o viceversa. Cuando se modifica uno, modificar el otro en el mismo PR.

---

## 3. Codegen (`graphql-codegen`)

Configurado en `codegen.ts` (raiz). El pipeline tiene dos pasos:

**Paso 1 — Descargar schema** (`scripts/fetch-schema.mjs`):
Hace introspeccion al endpoint de WordPress, stripea el BOM y guarda `lib/graphql/schema.json` localmente.

**Paso 2 — Generar tipos** (`graphql-codegen`):
Lee `lib/graphql/schema.json` y todos los `.graphql` bajo `lib/graphql/queries/`. Genera un unico archivo:

- `lib/graphql/generated/index.ts` — tipos del schema + `TypedDocumentNode` por cada query.

**Comandos:**
```bash
npm run codegen        # fetch-schema + genera (flujo normal)
npm run schema:fetch   # solo actualiza lib/graphql/schema.json (si el schema de WP cambio)
npm run codegen:watch  # observa cambios en los .graphql (usa el schema.json ya descargado)
```

**Cuando ejecutar:** despues de crear/editar cualquier `.graphql` o despues de cambios en el schema de WP (ej. nuevos meta fields en `bridge-fields.json`).

**Import correcto en fetchers:**
```ts
import { GetHomeDocument, type GetHomeQuery } from '@/lib/graphql/generated';
```
No existe `@/lib/graphql/generated/operations` ni `@/lib/graphql/generated/types` — todo esta en `index.ts`.

### Problemas conocidos (validados, 2026-04)

**BOM en respuesta del servidor WordPress.** Algunos servidores PHP (especialmente entornos staging con Traefik/Docker) devuelven un BOM al inicio de las respuestas JSON. El `@graphql-tools/url-loader` de codegen falla con `Unexpected response` al intentar parsear ese JSON. **No se resuelve** con headers `Accept`/`Content-Type`. La unica solucion estable es descargar el schema a un archivo local y que codegen lea el archivo: por eso existe `scripts/fetch-schema.mjs`.

**`.env.local` no se carga automaticamente en codegen.** `codegen.ts` se ejecuta con Node/jiti fuera del contexto de Next.js, por lo que `process.env` no incluye las variables de `.env.local`. `codegen.ts` lo parsea manualmente con `fs` en las primeras lineas. No instalar `dotenv` — el parseo manual es suficiente.

**Preset `import-types` no instalado.** Requiere `@graphql-codegen/import-types-preset`, fuera del stack base. Solucion adoptada: un unico archivo de salida `lib/graphql/generated/index.ts` con los tres plugins fusionados (`typescript`, `typescript-operations`, `typed-document-node`).

---

## 4. Webhooks salientes en WordPress

Configurar en `WP Webhooks → Send Data`:

| Trigger | URL | Body |
|---|---|---|
| `post_saved` (CPT singleton de home) | `https://<dominio>/api/revalidate?secret=<SECRET>` | `{ "tag": "wp:home" }` |
| `post_saved` (CPT de proyectos/portfolio) | mismo URL | `{ "tag": "wp:proyectos" }` |
| Cambio en options "general" | mismo URL | `{ "tag": "wp:general" }` |

Method: `POST`, Body type: `JSON / Custom Payload`.

**Tags validos** vienen de `lib/wordpress/tags.ts` (ver `data-layer`). Si el body trae un tag desconocido se ignora silenciosamente.

---

## 5. Ejemplo de naming validado (caso Cortina Studio)

Util como referencia de estilo, NO como configuracion universal:

| CPT slug en JetEngine | GraphQL plural (query) | GraphQL single (tipo) |
|---|---|---|
| `proyectos` | `proyectos { nodes }` | `Proyecto` |
| `home-singleton` | `homeSingletons { nodes }` | `HomeSingleton` |

Para cada cliente nuevo, **valida los nombres reales en GraphiQL antes de escribir queries.**

---

## 6. Lo que NO debes hacer

- Tocar `cortinastudio-wpgraphql-bridge.php` por necesidad de un cliente. Si necesita una mejora, sube version (`CSB_VERSION`) y aplicala a todos los clientes.
- Editar `bridge-fields.json` sin actualizar `wp-config.json.fields` en el mismo PR (mirror obligatorio).
- Usar `revalidatePath` en lugar de `revalidateTag`.
- Asumir nombres de query/tipo sin verificar en GraphiQL — el plugin los deriva del slug.
- Instalar `WPGraphQL SEO`, `Yoast SEO`, `Gato GraphQL` o `JetEngine WPGraphQL Integration`.
