# 003 — GTM + GA4 + Search Console + SEO (sitemap/robots/OG)

> Spec Driven Development (SDD). Esta es la **especificacion**: el *que* y el *por que*. El *como* paso a paso se ejecuta directamente contra los archivos listados abajo.

> **STATUS 2026-08-06 — plan aprobado, pendiente de ejecucion.**

---

## 1. Contexto

El sitio (Next.js 14.2.35, App Router, fabrica headless-WordPress, cliente actual Cortina Studio) hoy no tiene **ningun** script de analytics, ni `sitemap.xml`, ni `robots.txt`, ni imagenes de Open Graph/Twitter. La Metadata API se usa parcialmente: el layout raiz tiene un `metadata` estatico sin `metadataBase`/OG/Twitter, y la pagina de producto tiene un `generateMetadata` incompleto (sin imagenes, sin canonical). Todo el "contacto" del sitio ocurre via enlaces reales `<a href="wa.me/...">` (no hay formulario), lo que simplifica el mapeo de eventos: no hace falta instrumentar JS, basta con anotar esos enlaces con atributos `data-*` que GTM lee via Auto-Event Listeners.

## 2. Objetivo

Integrar Google Tag Manager, Google Analytics 4 y Google Search Console; mapear los eventos de interaccion reales del sitio con GTM y que se registren en GA4; y dejar sitemap.xml, robots.txt y las tarjetas Open Graph/Twitter funcionando completas y verificables en home y paginas de producto — todo respetando la separacion motor (reusable por cualquier cliente futuro) vs cliente (config/contenido de Cortina Studio) que exige `CLAUDE.md`/`AGENTS.md`.

## 3. Decisiones de alcance (cerradas con el usuario, 2026-08-06)

1. GTM se inyecta con el paquete oficial `@next/third-parties` (`GoogleTagManager`), no con `next/script` manual.
2. La imagen OG se genera dinamicamente por codigo (`ImageResponse`/`next/og`), no es un asset estatico que aporte el usuario.
3. Google Search Console se verifica por registro **TXT en DNS** (fuera del repo) — no se agrega meta tag de verificacion en el codigo.
4. No se instala `next-sitemap` (estaba declarado como intencion en `arquitectura-fabrica/SKILL.md` pero nunca implementado) — se usan las convenciones nativas `app/sitemap.ts`/`app/robots.ts` de Next 14 App Router.
5. GA4 se configura **dentro** de GTM (tag "GA4 Configuration"), no como script `gtag.js` separado en el codigo.

---

## 4. Fase A — Helper de metadata + `metadataBase` (motor)

**Nuevo:** `lib/seo/metadata.ts`
- `getSiteUrl()`: unica funcion que lee `process.env.NEXT_PUBLIC_SITE_URL`. Es la fuente de verdad del **frontend**; nunca usar `wp-config.json.siteUrl` (ese es el dominio del backend WP, `cortinastudio.gainweb.site`, distinto a proposito de `cortinastudio.com.gt`).
- `getBrandDefaults()`: lee `client-brief.json` (`brand_info.name`) para el `title.template` (`%s | Cortina Studio`) y un `default_description` (bloque nuevo abajo). Tolera que el bloque `seo` no exista (fallback), para no romper otros clientes que repliquen el motor sin ese campo.
- `buildMetadata({ title, description, path, locale, images?, type? })`: arma `title`, `description`, `alternates.canonical` (absoluta con `getSiteUrl()+path`), `openGraph.{title,description,url,siteName,locale,type,images}`, `twitter.{card:'summary_large_image', title, description, images}`. No toca `verification` (decision ya tomada: DNS).

**`client-brief.json` (cliente):** agregar bloque opcional:
```json
"seo": {
  "default_title": "Cortina Studio | Transformación de Espacios",
  "default_description": "Expertos en cortinas premium para privacidad, acústica y decoración."
}
```

**`app/[locale]/layout.tsx` (motor):** el `export const metadata` estatico (lineas 24-27) pasa a incluir `metadataBase: new URL(getSiteUrl())` + defaults globales (title template, OG siteName) via el helper. Next mergea automaticamente con la metadata mas especifica que exporte cada pagina hija.

**`app/[locale]/page.tsx` (cliente):** agregar `generateMetadata({ params })` usando `buildMetadata({ path: '/', locale: params.locale, ... })`.

**`app/[locale]/productos/[slug]/page.tsx` (cliente):** reemplazar el `generateMetadata` actual (lineas 26-39) por `buildMetadata({ path: '/productos/'+slug, ... })`. No se declara `openGraph.images` a mano — Next resuelve automaticamente el archivo especial `opengraph-image.tsx` de la misma ruta (Fase B). Se mantiene reutilizando `product.hero.title`/`product.hero.subtitle` (el `productSchema` de `lib/products.ts` no tiene campos SEO dedicados hoy; no se migra `content/productos.json` en este trabajo).

## 5. Fase B — Imagen Open Graph dinamica (motor)

**Nuevo:** `lib/seo/og-template.tsx` — componente JSX reutilizable para `ImageResponse` (satori): `BrandOgTemplate({ title, subtitle?, logoSrc, colors })`, 1200x630, colores desde `client-brief.json.design_system.colors` (`primary #3F4C42`, `secondary #D8CFC4`, `accent #B89B5E`, `background #FDFDFC`, `text #1A1A1A`).

**Fuente del logo:** usar `general.brand.logo` (URL real servida por WordPress, ya expuesta por `getGeneral()` en `lib/wordpress/getGeneral.ts` y usada hoy en Header/Footer) como `logoSrc`, con fallback al PNG estatico `public/images/logo/logo_guatemala_cortina_studio_3.png` si `general.brand.logo` viene vacio. Evita hardcodear un archivo que puede quedar desactualizado si el cliente cambia su logo en WP, y es coherente con que el build ya depende de que WordPress sea alcanzable (el propio `Dockerfile` lo advierte para home/productos).

**Runtime:** **no** declarar `export const runtime = 'edge'` — se deja el default (`nodejs`), consistente con el despliegue `output: 'standalone'` en Docker/Dokploy (no es Vercel Edge).

**Nuevo:** `app/[locale]/opengraph-image.tsx` — imagen por defecto (home y fallback), `size = {width:1200,height:630}`, `contentType = 'image/png'`, usa `BrandOgTemplate` con el nombre de marca + tagline.

**Nuevo:** `app/[locale]/productos/[slug]/opengraph-image.tsx` — reutiliza `getProductBySlug`/`getProductSlugs` de `lib/products.ts` (mismo patron que ya usa la pagina), `generateStaticParams()` con los slugs, titulo/subtitulo del producto. Se prioriza logo+colores+texto sobre la foto real del producto (las fotos vienen de Unsplash externo — no confiable como dependencia de build).

## 6. Fase C — Sitemap y Robots (motor, convencion nativa Next 14)

**Pequeno refactor previo:** hoy los locales activos estan duplicados y hardcodeados en `i18n/request.ts:7` (`const locales = ['es']`) y `middleware.ts:4` (`locales: ['es']`). Se extrae a `i18n/locales.ts` (nuevo, motor):
```ts
export const LOCALES = ['es'] as const;
export const DEFAULT_LOCALE = 'es';
```
y ambos archivos importan de ahi (cambio de comportamiento nulo, solo elimina la triplicacion que introduciria el sitemap). Toca dos archivos motor que hoy no estan en ninguna lista "de cliente"; se avisa explicitamente por ser fuera del scope estricto de "SEO/analytics".

**Nuevo:** `app/robots.ts` — `allow: '/'`, `disallow: ['/api/']`, `sitemap: {getSiteUrl()}/sitemap.xml`.

**Nuevo:** `app/sitemap.ts` — itera `LOCALES` x (home + `getProductSlugs()` de `lib/products.ts`), URLs absolutas con `getSiteUrl()`, respetando `localePrefix:'as-needed'` (el locale por defecto `es` no lleva prefijo). No inventa rutas `/soluciones/[slug]` (no existen — solo son anchors `#solucion-{key}` dentro del home). No incluye indice `/productos` (no existe esa pagina hoy).

## 7. Fase D — JSON-LD (motor)

**Nuevo:** `components/seo/JsonLd.tsx` (script `application/ld+json` generico), `OrganizationSchema.tsx`, `ProductSchema.tsx`, `BreadcrumbSchema.tsx`. Todos Server Components puros, sin fetch propio (reciben props).

- `OrganizationSchema` se monta en `app/[locale]/layout.tsx` con `name`/`url` (`getSiteUrl()`) + `general.social.*` (ya disponible ahi, `getGeneral()` ya se llama en linea 39) para `sameAs[]`.
- `ProductSchema` se monta en `productos/[slug]/page.tsx` con datos de `getProductBySlug()`.
- `BreadcrumbSchema`: `Inicio > {product.name}` en la pagina de producto (no hay indice `/productos` que enlazar).

## 8. Fase E — Google Tag Manager (`@next/third-parties`)

Agregar dependencia `@next/third-parties` a `package.json`.

En `app/[locale]/layout.tsx`, dentro de `<body>`:
```tsx
{process.env.NEXT_PUBLIC_GTM_ID && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />}
```
Condicionado a la env var para que el motor no rompa en un cliente futuro sin GTM configurado aun. El componente maneja internamente el `<noscript>` de fallback.

**Configuracion manual en GTM (fuera de codigo, paso del usuario):**
1. Crear contenedor en tagmanager.google.com → obtener `GTM-XXXXXXX`.
2. Dentro de GTM: Tag **"GA4 Configuration"** con el Measurement ID de GA4 (`G-XXXXXXX`), trigger "All Pages" — GA4 se configura *dentro* de GTM, no como script separado en el codigo.
3. Triggers "Click - All Elements" filtrando por los atributos `data-gtm-event`/`data-gtm-location` (Fase G) + Tags "GA4 Event" leyendo esas variables.
4. Publicar el contenedor.

## 9. Fase F — Tracker de pageview SPA (motor)

**Nuevo:** `components/analytics/RouteChangeTracker.tsx` (client component): usa `usePathname()`/`useSearchParams()` de `next/navigation`, en `useEffect` hace `window.dataLayer.push({event:'page_view', page_path})` en cada cambio de ruta — necesario porque la navegacion interna via `next/link` no dispara un nuevo page load y GTM/GA4 no lo detectan solos. Montado una vez en `app/[locale]/layout.tsx`, envuelto en `<Suspense fallback={null}>` (requisito de `useSearchParams()` en App Router).

Si `pathname` matchea `/productos/:slug`, este mismo tracker dispara ademas un evento `view_item` con el slug (no se instrumenta desde dentro del RSC de producto — evita crear un client boundary nuevo por pagina).

**Nuevo (opcional, pequeno):** `lib/analytics/dataLayer.ts` — `pushDataLayerEvent()` helper para futuros eventos programaticos, no critico para este alcance.

## 10. Fase G — Event map declarativo (`data-gtm-*`)

No se agregan `onClick` handlers en React — se anotan los `<a>`/`<Link>` existentes con atributos `data-*` que GTM lee via Auto-Event Listeners (Click - All Elements). `next/link` reenvia props desconocidas al `<a>` real (patron ya usado en el repo con `target`/`rel`/`aria-label`).

Convencion: `data-gtm-event` (nombre snake_case GA4-friendly), `data-gtm-location` (seccion), `data-gtm-label` (opcional, ej. nombre de producto o red social).

| Archivo | CTA | Atributos |
|---|---|---|
| `components/layout/Header.tsx` (desktop ~238, mobile ~365) | WhatsApp "Agendar Cita" | `click_whatsapp` / `header`, `header_mobile` |
| `components/layout/Footer.tsx` (CTA strip) | WhatsApp "Hablar con un experto" | `click_whatsapp` / `footer` |
| `components/layout/Footer.tsx:34-44` (`contactLinks`) | tel / mailto | `click_call` / `click_email`, `footer` |
| `components/layout/Footer.tsx:152-168` (`socialLinks`) | Instagram/TikTok/Facebook | `click_social` / `footer`, label = red |
| `components/sections/Hero.tsx`, `Hero2.tsx`, `Hero3.tsx` | "Cotiza por WhatsApp" | `click_whatsapp` / `hero` |
| `components/sections/FAQCarousel.tsx` (~131) | overlay WhatsApp | `click_whatsapp` / `faq_carousel` |
| `components/sections/FAQSection.tsx` | CTA final WhatsApp | `click_whatsapp` / `faq_section` |
| `components/sections/ReelsSection.tsx` | "Quiero algo asi" | `click_whatsapp` / `reels_section` |
| `components/sections/ProcessSection.tsx` | "Empieza Ahora" | `click_whatsapp` / `process_section` |
| `components/sections/product/{ProductHero,ProductSignature,ProductBenefits,ProductWhy,ProductClosing}.tsx` | WhatsApp por producto | `click_whatsapp` / `product_hero` etc., label = `product.name` |
| `components/ui/ReelCard.tsx:167-175` | link a reel original | `click_social` / `reel_card`, label = plataforma |
| `components/sections/SolutionsSection.tsx:76-79` | card → `/productos/{slug}` | `select_content` / `solutions_section`, label = slug |
| `components/sections/product/GalleryLightbox.tsx` (~110-159) | abrir/prev/next lightbox | `select_item` en el trigger de apertura (revisar si vive en `ProductGallery.tsx`) |

Nota preexistente sin corregir (no bloquea): `FAQCarousel.tsx` arma la URL de WhatsApp inline en vez de usar `buildWhatsAppUrl` de `lib/utils.ts` — se le agregan los atributos igual, sin tocar esa inconsistencia.

## 11. Fase H — Variables de entorno y Docker

**`.env.example` (agregar):**
```
# Google Tag Manager — deja vacío para desactivar GTM sin romper el build
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```
No se agrega `NEXT_PUBLIC_GA_ID` ni variable de verificacion de Search Console (decisiones ya tomadas: GA4 vive dentro de GTM, GSC se verifica por DNS).

**`Dockerfile`:** el Dockerfile ya advierte explicitamente que las variables `NEXT_PUBLIC_*` deben pasarse como **Build Args** ademas de Environment, porque se inlinean en `next build` (ver comentario al inicio del archivo y el manejo actual de `NEXT_PUBLIC_WORDPRESS_API_URL`/`NEXT_PUBLIC_SITE_URL` en el stage `builder`). Hay que agregar el mismo tratamiento para `NEXT_PUBLIC_GTM_ID`:
```dockerfile
ARG NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
```
en el stage `builder`, junto a las otras dos. Si se omite, GTM quedara vacio en produccion aunque se configure en Dokploy solo como "Environment".

**`.env.local` real (usuario):** coloca su `NEXT_PUBLIC_GTM_ID=GTM-<real>` y confirma que `NEXT_PUBLIC_SITE_URL` sea el dominio del frontend (`https://cortinastudio.com.gt`), nunca `wp-config.json.siteUrl`.

## 12. Fase I — Actualizacion de skills (mirror obligatorio)

**`.claude/skills/arquitectura-fabrica/SKILL.md`:**
- Seccion "SEO": reemplazar la mencion de `next-sitemap` por "Convenciones nativas de Next 14 App Router (`app/sitemap.ts`, `app/robots.ts`, `app/[locale]/opengraph-image.tsx`) — sin dependencias externas."
- Agregar nota de "Analytics": `@next/third-parties` (`GoogleTagManager`) para GTM; GA4 se configura como tag dentro de GTM; eventos via atributos `data-gtm-event`/`data-gtm-location` + Auto-Event Listeners, sin `onClick` nuevos en React.

**`.claude/skills/replicacion-cliente/SKILL.md`:**
- Tabla "archivos que cambian por cliente": agregar `NEXT_PUBLIC_GTM_ID` a la fila de `.env.local`; agregar mencion del bloque opcional `client-brief.json.seo.*`.
- Tabla "codigo de fabrica que no cambia": agregar `app/sitemap.ts`, `app/robots.ts`, `app/[locale]/opengraph-image.tsx` (estructura), `lib/seo/*`, `components/seo/*`, `components/analytics/RouteChangeTracker.tsx`, `lib/analytics/dataLayer.ts`, `i18n/locales.ts`.

**Mirror obligatorio:** replicar el mismo diff byte-a-byte en `.opencode/skills/arquitectura-fabrica/SKILL.md` y `.opencode/skills/replicacion-cliente/SKILL.md` en el mismo cambio (regla de `CLAUDE.md`/`AGENTS.md`).

## 13. Verificacion

1. `npx tsc --noEmit` y `npm run lint`.
2. `npm run build` — confirma que `app/sitemap.ts`, `app/robots.ts`, ambos `opengraph-image.tsx` generan sin error (los de producto se generan para cada slug via `generateStaticParams`).
3. `npm run dev` → revisar `/sitemap.xml` y `/robots.txt` (URLs absolutas correctas), y abrir `/opengraph-image` y `/productos/<slug>/opengraph-image` directamente para ver el PNG.
4. Validar OG/Twitter con Facebook Sharing Debugger / Twitter Card Validator / opengraph.xyz (requiere sitio publico o tunel).
5. GTM Preview Mode: confirmar que el contenedor carga, que `page_view` se dispara en cada navegacion SPA, y que los CTAs con `data-gtm-event` disparan sus triggers.
6. Consola del navegador → `window.dataLayer` — confirmar eventos.
7. GA4 Realtime — confirmar que los eventos configurados en GTM llegan con los parametros esperados.
8. Search Console: paso manual del usuario — agrega el TXT en el DNS de `cortinastudio.com.gt`, espera propagacion, verifica en la consola de GSC. No requiere cambios en este repo.

## 14. Notas registradas, no resueltas en este trabajo

- Rank Math esta instalado en el WordPress backend pero sus campos SEO nunca se expusieron via `bridge-fields.json` ni se consumen en `lib/wordpress/` — este trabajo no lo integra; los defaults de SEO vienen de `client-brief.json`. Conectar Rank Math seria una iniciativa aparte.
- `client-brief.json.brand_info.domain` y `wp-config.json.siteUrl` son dominios distintos a proposito (frontend vs backend WP staging) — `NEXT_PUBLIC_SITE_URL` es la unica fuente de verdad para sitemap/canonical/OG.
