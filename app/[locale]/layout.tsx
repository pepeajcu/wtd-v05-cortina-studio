import { Suspense } from 'react';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { GoogleTagManager } from '@next/third-parties/google';
import "../globals.css";
import type { Metadata } from "next";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getAllProducts } from '@/lib/products';
import { getSiteUrl, getBrandDefaults } from '@/lib/seo/metadata';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { RouteChangeTracker } from '@/components/analytics/RouteChangeTracker';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['italic'],
  weight: ['400'],
});

const brand = getBrandDefaults();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: brand.defaultTitle,
    template: brand.titleTemplate,
  },
  description: brand.defaultDescription || "Expertos en cortinas premium para privacidad, acústica y decoración.",
  openGraph: {
    siteName: brand.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const general = await getGeneral();
  const SOLUTION_SLUGS = new Set(['calor', 'privacidad', 'acustica', 'decorativo']);
  const productLinks = getAllProducts()
    .filter((p) => !SOLUTION_SLUGS.has(p.slug))
    .map((p) => ({
      label: p.name,
      href: `/productos/${p.slug}`,
    }));

  const siteUrl = getSiteUrl();
  const sameAs = [general.social.instagram, general.social.tiktok, general.social.facebook].filter(
    (url): url is string => Boolean(url),
  );

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang={locale} className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <Suspense fallback={null}>
          <RouteChangeTracker />
        </Suspense>
        <OrganizationSchema
          name={brand.name}
          url={siteUrl}
          logo={general.brand.logo}
          sameAs={sameAs}
        />
        <NextIntlClientProvider messages={messages}>
          <Header products={productLinks} whatsappNumber={general.whatsappNumber} />
          <main>
            {children}
          </main>
          <Footer general={general} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'es' }];
}
