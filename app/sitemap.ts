import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/metadata';
import { getProductSlugs } from '@/lib/products';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

function withLocalePath(path: string, locale: Locale): string {
  // localePrefix: 'as-needed' -> el locale por defecto no lleva prefijo
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

function alternates(path: string, base: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, `${base}${withLocalePath(path, l)}`]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const slugs = getProductSlugs();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${base}${withLocalePath('/', locale)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: alternates('/', base) },
    });

    for (const slug of slugs) {
      const path = `/productos/${slug}`;
      entries.push({
        url: `${base}${withLocalePath(path, locale)}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages: alternates(path, base) },
      });
    }
  }

  return entries;
}
