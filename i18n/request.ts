import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LOCALES, DEFAULT_LOCALE } from './locales';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? DEFAULT_LOCALE;

  if (!LOCALES.includes(locale as (typeof LOCALES)[number])) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
