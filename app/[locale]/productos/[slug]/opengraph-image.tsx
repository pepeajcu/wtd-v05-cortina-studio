import { ImageResponse } from 'next/og';
import clientBrief from '@/client-brief.json';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getSiteUrl } from '@/lib/seo/metadata';
import { BrandOgTemplate } from '@/lib/seo/og-template';
import { getProductBySlug, getProductSlugs } from '@/lib/products';

export const alt = clientBrief.brand_info.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  const general = await getGeneral();
  const logoSrc = general.brand.logo || `${getSiteUrl()}/images/logo/logo_guatemala_cortina_studio_3.png`;

  return new ImageResponse(
    (
      <BrandOgTemplate
        title={product?.hero.title ?? clientBrief.brand_info.name}
        subtitle={product?.hero.subtitle}
        logoSrc={logoSrc}
        colors={clientBrief.design_system.colors}
      />
    ),
    { ...size },
  );
}
