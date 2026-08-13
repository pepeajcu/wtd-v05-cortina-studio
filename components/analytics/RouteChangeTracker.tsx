'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushDataLayerEvent } from '@/lib/analytics/dataLayer';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';

const PRODUCT_PATH_REGEX = /^\/productos\/([^/]+)\/?$/;
// Tipado como string[] a proposito: con un solo locale configurado, TS reduce
// el tipo literal a `never` tras el filtro si se deja inferir (LOCALES es un
// tuple de un solo elemento vía `as const`).
const NON_DEFAULT_LOCALES: string[] = [...LOCALES].filter((locale) => locale !== DEFAULT_LOCALE);

function stripLocalePrefix(pathname: string): string {
  for (const locale of NON_DEFAULT_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/';
    }
  }
  return pathname;
}

export function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    pushDataLayerEvent({ event: 'page_view', page_path: pagePath });

    const productMatch = stripLocalePrefix(pathname).match(PRODUCT_PATH_REGEX);
    if (productMatch?.[1]) {
      pushDataLayerEvent({ event: 'view_item', item_id: productMatch[1] });
    }
  }, [pathname, searchParams]);

  return null;
}
