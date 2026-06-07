import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
