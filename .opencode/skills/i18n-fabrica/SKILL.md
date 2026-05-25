---
name: i18n-fabrica
description: Implementacion de next-intl en la fabrica — middleware, layouts con setRequestLocale, namespaces de mensajes, patron de labels delegadas (RSC pasa strings traducidos a client components). Cargar cuando la tarea toque rutas localizadas, traducciones, mensajes o componentes que necesitan i18n.
---

# Internationalization (i18n)

Stack: **next-intl** con locales `es` (default) e `en`. Rutas localizadas: `/es/...` y `/en/...`. Todos los textos estaticos viven en `messages/{locale}.json`, nunca hardcodeados.

---

## 1. Configuracion Base

```ts
// i18n.ts — archivo raiz
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'es';
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',  // /es se omite, /en se muestra
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

## 2. Uso en Server Components (RSC)

```ts
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function MySection() {
  const t = await getTranslations('namespace');
  return <h2>{t('title')}</h2>;
}
```

---

## 3. Uso en Client Components

```ts
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  return <h2>{t('title')}</h2>;
}
```

---

## 4. En Layout (obligatorio)

```ts
// app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params: { locale } }) {
  setRequestLocale(locale);  // Habilita SSG
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fontVar1} ${fontVar2}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

---

## 5. En cada Page (obligatorio para SSG)

```ts
export default function MyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);  // OBLIGATORIO en cada page para SSG
  return <main>...</main>;
}
```

---

## 6. Estructura de `messages/{locale}.json`

```json
{
  "namespace": {
    "eyebrow": "...",
    "title": "...",
    "subtitle": "...",
    "field_key": "..."
  }
}
```

**Convenciones:**
- Un namespace por seccion: `hero`, `problems`, `faq`, `process`, `reels`, `cta`, `footer`, `nav`.
- Namespaces de componentes UI compartidos: `whatsapp`, `projectCard`, `solutions`, `products`.
- Claves siempre en `snake_case`.
- Preguntas FAQ numeradas: `q_1`, `a_1`, `q_2`, `a_2`...
- Pasos numerados: `step_1_title`, `step_1_desc`...

---

## 7. Patron de Labels Delegadas

Cuando un componente `"use client"` necesita textos traducidos, el RSC padre los resuelve y los pasa como props:

```ts
// RSC padre (server)
const t = await getTranslations('projectCard');
const labels: ProjectCardLabels = {
  spaceLabel:   t('space_label'),
  problemLabel: t('problem_label'),
};
return <ReelCard reel={reel} labels={labels} />;

// Client component — recibe strings ya traducidos, nunca llama a useTranslations
export function ReelCard({ reel, labels }: ReelCardProps) { ... }
```

**Cuando usar este patron:** Cuando el client component es complejo (video player, carousel, accordion) y las traducciones son solo labels estaticos. Esto evita cargar el bundle de i18n en el cliente.

**Cuando NO usarlo:** Cuando el client component necesita traducciones dinamicas o interpolacion. En ese caso usar `useTranslations` directamente.

---

## 8. Frontera con WordPress (modelo de 3 tiers)

Por defecto, **todo el copy del sitio vive en `messages/{locale}.json`** — incluyendo titulos, subtitulos, eyebrows, CTAs, copy de seccion, microcopy, labels de UI y navegacion. Es Tier A (ver `arquitectura-fabrica` seccion 7).

A WordPress solo van:
- **Tier B (datos operativos):** numero de WhatsApp, telefono, email, direccion, redes sociales, asset de logo, imagenes del hero/galerias.
- **Tier C (datos dinamicos):** colecciones que el cliente crece o reordena (proyectos, blog, testimonios), incluyendo el selector de cuales aparecen en home.

**Regla de decision:** ¿el cliente lo va a editar mas de 2 veces al ano? Si no → `messages/`. Si si → WP.

Esto significa que en un sitio bilingue:
- El cliente NO edita copy desde WP (lo hace el dev en el JSON con codigo).
- El bundle de mensajes i18n tiene el copy editorial completo, no solo labels.
- Las queries GraphQL son delgadas (solo IDs, assets, datos operativos).

Excepciones validas (escalar de A a B solo cuando lo justifique):
- Un cliente especifico pide editar copy de hero sin avisar al dev → mover ese campo concreto a WP **solo para ese cliente**, no para el motor.
- Un campo bilingue que vive en WP requiere fields `<key>_es` y `<key>_en` separados o un plugin de i18n en WP (caso raro).

---

## 9. Lo que NO debes hacer

- Hardcodear strings en JSX — todo via `t('key')`.
- Olvidar `setRequestLocale(locale)` en layout o page → rompe SSG.
- Llamar `useTranslations` en client components cuando el RSC padre puede pasarlas como labels.
- Anadir locales nuevos sin actualizar `middleware.ts` y `messages/`.
- Mover copy estatico a WP "por si el cliente quiere editarlo" — empezar siempre en JSON; escalar solo cuando el cliente lo pida explicitamente.
