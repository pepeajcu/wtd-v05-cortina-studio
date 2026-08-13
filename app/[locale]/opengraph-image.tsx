import { ImageResponse } from 'next/og';
import clientBrief from '@/client-brief.json';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getSiteUrl } from '@/lib/seo/metadata';
import { BrandOgTemplate } from '@/lib/seo/og-template';

export const alt = clientBrief.brand_info.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const general = await getGeneral();
  const logoSrc = general.brand.logo || `${getSiteUrl()}/images/logo/logo_guatemala_cortina_studio_3.png`;

  return new ImageResponse(
    (
      <BrandOgTemplate
        title={clientBrief.brand_info.name}
        subtitle="Transformación de Espacios"
        logoSrc={logoSrc}
        colors={clientBrief.design_system.colors}
      />
    ),
    { ...size },
  );
}
