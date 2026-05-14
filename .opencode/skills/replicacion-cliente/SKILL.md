---
name: replicacion-cliente
description: Checklist de Fase 1-4 para levantar un cliente nuevo desde el repo base, contrato de archivos que cambian vs codigo de fabrica que no, y reglas de oro de la fabrica. Cargar cuando se inicie un cliente nuevo, se documente el flujo de onboarding o se decida si un cambio pertenece al motor o al cliente.
---

# Replicacion a un Cliente Nuevo — Contrato de Fabrica

**Promesa:** un cliente nuevo se levanta tocando 3 archivos de configuracion (y dos opcionales). Todo lo demas se reusa intacto. Si te ves obligado a tocar codigo "estandar", PARA y plantea evolucionar la base — no parchees el cliente actual.

---

## 1. Archivos que cambian por cliente

| # | Archivo | Que llevar del cliente | Quien lo edita |
|---|---|---|---|
| 1 | `client-brief.json` | Paleta, tipografias, **`design_system.vibe`** (`high-end` \| `minimalist` \| `brutalist`), **`design_system.motion`** (`calm` \| `fluid` \| `perpetual`), audiencia, estructura de paginas | Dev/Disenador (input creativo) |
| 2 | `wp-config.json` | `endpoint`, `siteUrl`, `cpt.*` (slug, single, plural, limit), `fields.*.{seccion}.{campo}` (meta keys), `iconMap` | Dev (Fase 1 del cliente) |
| 3 | `wordpress/plugins/cortinastudio-wpgraphql-bridge/bridge-fields.json` | Lista plana de meta keys por CPT (`scalar` y `repeater`) | Dev (Fase 2 del cliente) — debe espejar el #2 |
| 4 | `tailwind.config.ts` | `colors.*` y `fontFamily.*` derivados del brief; resto sin tocar | Dev (Fase 1) |
| 5 | `messages/{es,en}.json` | Eyebrows, labels, errores, microcopy de UI | Dev a medida que construye secciones |

---

## 2. Archivos que NO cambian (codigo de fabrica)

- `lib/wordpress/{config,client,tags,index}.ts` y `lib/wordpress/README.md`
- `app/api/revalidate/route.ts`
- `wordpress/plugins/cortinastudio-wpgraphql-bridge/cortinastudio-wpgraphql-bridge.php`
- `components/motion/FadeIn.tsx`, `components/motion/FadeInStagger.tsx`
- `app/globals.css` (la base CSS de la fabrica — ver `diseno-fabrica`)
- `i18n/request.ts`, `middleware.ts`
- `codegen.ts`
- Reglas de diseno: paddings, easing, anatomia de seccion, jerarquia tipografica, opacidades estandar (ver `diseno-fabrica`)

Si necesitas cambiar algo de esta lista, **es una evolucion de la fabrica**, no del cliente. Discutela con el usuario, actualiza la base para todos los proyectos, y deja un commit explicito.

---

## 3. Checklist de levantamiento

### Frontend (Fase 1 del cliente)

- [ ] Clonar el repo base. Verificar que `lib/wordpress/`, `app/api/revalidate/`, `components/motion/`, `codegen.ts` esten intactos.
- [ ] Reemplazar `client-brief.json` con el del nuevo cliente. Confirmar que **`design_system.vibe`** y **`design_system.motion`** esten poblados con valores validos del enum (si faltan, definirlos con el cliente antes de avanzar — sin esos campos `diseno-fabrica` no puede seleccionar familia ni preset de motion).
- [ ] Mapear colores y tipografias del brief en `tailwind.config.ts`.
- [ ] Cargar fuentes con `next/font/google` en `app/[locale]/layout.tsx`.
- [ ] Editar `wp-config.json`: `endpoint`, `siteUrl`, `cpt.*`, `fields.*` placeholders (los meta keys finales se confirman tras crear los CPTs en WP).
- [ ] Crear `.env.local` con `NEXT_PUBLIC_WORDPRESS_API_URL`, `WORDPRESS_REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- [ ] `npx tsc --noEmit` sin errores nuevos.

### Backend WordPress (Fase 2 del cliente)

- [ ] WP nuevo con HTTPS y dominio propio (`cms.<dominio>`).
- [ ] Instalar y activar: WPGraphQL, JetEngine, Rank Math, WP Webhooks (ver `wordpress-bridge`).
- [ ] Subir el plugin `cortinastudio-wpgraphql-bridge` a `wp-content/plugins/`. Activarlo.
- [ ] Crear los CPTs en JetEngine. Anotar los slugs reales.
- [ ] En cada CPT crear los meta fields (scalar y repeater). Anotar los meta keys.
- [ ] Editar `bridge-fields.json` del plugin con los meta keys exactos. Subir el archivo actualizado al servidor (FTP/SSH/UI del plugin).
- [ ] Verificar en `Settings → WPGraphQL Bridge` que los CPTs aparezcan como "Expuesto" y los fields como configurados.
- [ ] Validar en GraphiQL IDE que los queries devuelvan datos.
- [ ] Configurar webhooks en `WP Webhooks → Send Data`.
- [ ] Sincronizar `wp-config.json` del frontend con los nombres reales validados.

### Conexion (Fase 3 del cliente)

- [ ] Escribir queries `.graphql` en `lib/graphql/queries/` (una por dominio).
- [ ] `npm run codegen` para generar tipos.
- [ ] Crear fetchers `lib/wordpress/getHome.ts`, `lib/wordpress/getProyectos.ts`, etc. — cada uno con `wpFetch` + tag de `WP_TAGS` + Zod en repeaters (ver `data-layer`).
- [ ] Reemplazar arrays estaticos en `components/sections/*` por props que vengan del fetcher.

### Validacion final del cliente

- [ ] `npx tsc --noEmit` + `npm run lint` + `npm run build` pasan.
- [ ] Editar un post en WP → POST llega a `/api/revalidate` → la pagina se actualiza dentro de los siguientes segundos sin redeploy.
- [ ] Lighthouse / Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- [ ] Checklist de calidad premium cumplido en cada seccion (ver `diseno-fabrica`).

---

## 4. Flujo de Trabajo — Paso a Paso (resumen)

1. Lee `client-brief.json` para obtener paleta, tipografia, **`design_system.vibe`**, **`design_system.motion`** y estructura del cliente. Con el `vibe` cargas UNA skill de familia de `.claude/skills/taste-design/` (ver `diseno-fabrica` seccion 4). Con el `motion` decides si aplicar `motion-calm-preset.md` o delegar motion a la familia.
2. Configura `tailwind.config.ts` con los tokens exactos del brief + tokens estandar.
3. Configura `next-intl` con locales `es` (default) y `en` (ver `i18n-fabrica`).
4. Configura `globals.css` con la base CSS (ver `diseno-fabrica`).
5. Reusa `components/motion/FadeIn` y `FadeInStagger` — son codigo de fabrica.
6. **Layout principal primero:** Header + Footer + `app/[locale]/layout.tsx` con providers.
7. Edita `wp-config.json` y `bridge-fields.json` (mirror obligatorio).
8. **PAUSA y espera aprobacion explicita** antes de continuar con secciones internas.
9. Construye seccion por seccion siguiendo el blueprint de `diseno-fabrica`. Datos primero como array tipado; cuando esten listos los queries GraphQL, swap a fetcher (ver `data-layer`).
10. Antes de crear un componente nuevo, revisa si `components/ui/*` o `components/sections/*` ya tienen algo adaptable.
11. Cuando los queries esten listos: `npm run codegen`, crear fetchers, conectar al RSC.
12. Al terminar cada entregable: `npx tsc --noEmit` + `npm run lint` + sin `console.log` + sin codigo comentado muerto.

---

## 5. Reglas de Oro de la Fabrica

1. **Mirror obligatorio:** todo meta_key que aparece en `bridge-fields.json` aparece (camelCase) en `wp-config.json.fields.<cpt>.*`. Cuando cambia uno, cambia el otro en el mismo PR.
2. **Repeater = JSON string:** los repeaters de JetEngine llegan como string. Validar con Zod en el fetcher antes de devolver al RSC. Nunca pasar el JSON sin parsear al componente.
3. **Naming GraphQL lo decide el plugin, no tu:** verifica los nombres reales en GraphiQL antes de escribir queries. Slug en `s` → singular = slug sin la s. Slug sin `s` → plural = slug + s.
4. **Tags antes que paths:** revalidacion siempre por `revalidateTag`, nunca por `revalidatePath`.
5. **Endpoint por entorno:** `NEXT_PUBLIC_WORDPRESS_API_URL` siempre gana sobre `wp-config.json.endpoint`. Asi mismo codigo apunta a CMS distintos en dev/staging/prod.
6. **Plugin PHP es inmutable por cliente:** si necesita una mejora, sube version (`CSB_VERSION`) y aplicala a todos los clientes en el siguiente roll.
7. **Sin Apollo, sin REST, sin functions.php:** el stack es `wpFetch` + `graphql-request` + plugin propio. Cualquier desviacion va contra la promesa de la fabrica.

---

## 6. Estado actual del repo (Cortina Studio como ocupante)

- **Fase 1 — Base de fabrica** [completa]: `lib/wordpress/`, `wp-config.json`, `/api/revalidate`, codegen y `.env.example`.
- **Fase 2 — Backend WordPress** [completa]: plugin `cortinastudio-wpgraphql-bridge` v3.0.0 instalado, CPTs (`proyectos`, `home-singleton`) expuestos a WPGraphQL, fields validados en GraphiQL.
- **Fase 3 — Queries y fetchers** [pendiente]: crear `.graphql` por seccion + `getHome()`, `getProyectos()` en `lib/wordpress/`, correr `npm run codegen`.
- **Fase 4 — Conectar componentes** [pendiente]: reemplazar arrays estaticos en `components/sections/*` por props que vengan de los fetchers.

Para cualquier cliente nuevo, las Fases 1 y 2 ya estan resueltas conceptualmente — la replicacion se concentra en personalizar los archivos de la columna izquierda y ejecutar las Fases 3 y 4.

---

## 7. Lo que NO debes hacer

- Tocar archivos de la columna "no cambia" para resolver un caso del cliente actual — es evolucion del motor.
- Continuar con paginas internas antes de aprobar el layout.
- Generar codigo sin leer `client-brief.json` primero.
- Saltarte el mirror entre `bridge-fields.json` y `wp-config.json.fields`.
