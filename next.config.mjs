import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
