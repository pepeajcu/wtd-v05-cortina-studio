import type { Metadata } from 'next';
import clientBrief from '@/client-brief.json';

interface SeoBrief {
  default_title?: string;
  default_description?: string;
}

/**
 * Fuente de verdad de la URL del frontend. NO usar wp-config.json.siteUrl:
 * ese es el dominio del backend WordPress (puede ser staging), no el del sitio publico.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function getBrandDefaults(): {
  name: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
} {
  const brandName = clientBrief.brand_info?.name ?? 'Sitio';
  const seo: SeoBrief = (clientBrief as { seo?: SeoBrief }).seo ?? {};

  return {
    name: brandName,
    titleTemplate: `%s | ${brandName}`,
    defaultTitle: seo.default_title ?? brandName,
    defaultDescription: seo.default_description ?? '',
  };
}

export interface SeoInput {
  /** Titulo especifico de la pagina, sin el sufijo de marca (el template lo agrega). */
  title: string;
  description: string;
  /** Ruta relativa, ej. '/', '/productos/ripplefold'. */
  path: string;
  locale: string;
  /** URLs absolutas opcionales para OG/Twitter; si se omite, Next usa el opengraph-image.tsx de la ruta. */
  images?: string[];
  type?: 'website' | 'article';
}

export function buildMetadata({ title, description, path, locale, images, type = 'website' }: SeoInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  const brand = getBrandDefaults();

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: brand.name,
      locale,
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
