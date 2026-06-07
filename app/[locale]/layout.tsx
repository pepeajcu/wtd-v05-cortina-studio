import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import "../globals.css";
import type { Metadata } from "next";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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

  return (
    <html lang={locale} className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header products={productLinks} />
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
