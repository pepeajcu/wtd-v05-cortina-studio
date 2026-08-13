import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ProductHero } from '@/components/sections/product/ProductHero';
import { ProductSignature } from '@/components/sections/product/ProductSignature';
import { ProductBenefits } from '@/components/sections/product/ProductBenefits';
import { ProductGallery } from '@/components/sections/product/ProductGallery';
import { ProductSteps } from '@/components/sections/product/ProductSteps';
import { ProductClosing } from '@/components/sections/product/ProductClosing';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import {
  getProductBySlug,
  getProductSlugs,
  buildProductWhatsAppMessage,
} from '@/lib/products';
import { buildMetadata, getSiteUrl } from '@/lib/seo/metadata';
import { ProductSchema } from '@/components/seo/ProductSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

interface ProductPageParams {
  locale: string;
  slug: string;
}

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: ProductPageParams }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  return buildMetadata({
    title: product.hero.title,
    description: product.hero.subtitle,
    path: `/productos/${params.slug}`,
    locale: params.locale,
  });
}

export default async function ProductPage({ params }: { params: ProductPageParams }) {
  const { locale, slug } = params;
  setRequestLocale(locale);

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const general = await getGeneral();
  const whatsappMessage = buildProductWhatsAppMessage(product.name);
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/productos/${slug}`;

  return (
    <main>
      <ProductSchema
        name={product.hero.title}
        description={product.hero.subtitle}
        image={product.images.hero}
        url={productUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: siteUrl },
          { name: product.name, url: productUrl },
        ]}
      />
      <ProductHero
        eyebrow={product.name}
        title={product.hero.title}
        subtitle={product.hero.subtitle}
        ctaLabel={product.hero.ctaLabel}
        image={product.images.hero}
        whatsappNumber={general.whatsappNumber}
        whatsappMessage={whatsappMessage}
      />
      <ProductSignature
        signature={product.signature}
        whatsappNumber={general.whatsappNumber}
        whatsappMessage={whatsappMessage}
        whatsappLabel={product.closing.ctaLabel}
      />
      <ProductGallery gallery={product.gallery} />
      <ProductBenefits
        title={product.benefits.title}
        items={product.benefits.items}
        whatsappNumber={general.whatsappNumber}
        whatsappMessage={whatsappMessage}
        whatsappLabel={product.closing.ctaLabel}
      />
      <ProductSteps
        title={product.how.title}
        intro={product.how.intro}
        steps={product.how.steps}
      />
      <ProductClosing
        title={product.closing.title}
        subtitle={product.closing.subtitle}
        ctaLabel={product.closing.ctaLabel}
        whatsappNumber={general.whatsappNumber}
        whatsappMessage={whatsappMessage}
      />
    </main>
  );
}
