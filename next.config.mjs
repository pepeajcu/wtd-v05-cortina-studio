import createNextIntlPlugin from 'next-intl/plugin';
import clientRedirects from './content/redirects.json' with { type: 'json' };

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autocontenido para Docker/Dokploy: genera .next/standalone con
  // server.js + node_modules trazados. No afecta a `next dev` ni a Vercel.
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cortinastudio.gainweb.site' },
      { protocol: 'https', hostname: 'www.americanblinds.com.mx' },
      { protocol: 'https', hostname: 'americanblinds.com.mx' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  // Redirects 301 del cliente (URLs heredadas de un sitio previo hacia las
  // rutas actuales) viven como datos en content/redirects.json, no aqui.
  async redirects() {
    return clientRedirects;
  },
};

export default withNextIntl(nextConfig);
