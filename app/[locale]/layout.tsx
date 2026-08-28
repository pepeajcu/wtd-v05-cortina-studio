import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Script from 'next/script';
import "../globals.css";
import type { Metadata } from "next";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloatingCta } from '@/components/layout/WhatsAppFloatingCta';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getAllProducts } from '@/lib/products';

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

export const metadata: Metadata = {
  title: "Cortina Studio | Transformación de Espacios",
  description: "Expertos en cortinas premium para privacidad, acústica y decoración.",
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

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang={locale} className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      {gtmId && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      <body className="antialiased">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <NextIntlClientProvider messages={messages}>
          <Header products={productLinks} whatsappNumber={general.whatsappNumber} />
          <main className="pb-24 md:pb-0">
            {children}
          </main>
          <Footer general={general} />
          <WhatsAppFloatingCta whatsappNumber={general.whatsappNumber} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'es' }];
}
