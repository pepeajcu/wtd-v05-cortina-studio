import createNextIntlPlugin from 'next-intl/plugin';

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
};

export default withNextIntl(nextConfig);
