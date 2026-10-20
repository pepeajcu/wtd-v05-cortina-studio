import type { MetadataRoute } from 'next';
import { getProductSlugs } from '@/lib/products';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cortinastudio.com.gt';

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls: MetadataRoute.Sitemap = getProductSlugs().map((slug) => ({
    url: `${SITE_URL}/productos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...productUrls,
  ];
}
