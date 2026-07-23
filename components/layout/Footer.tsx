'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import type { GeneralData } from '@/lib/wordpress/getGeneral';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

const FacebookIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

const TikTokIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const InstagramIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

export function Footer({ general }: { general: GeneralData }) {
  const t = useTranslations('footer');
  const whatsappUrl = buildWhatsAppUrl(general.whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');

  const contactLinks = [
    general.contactPhone && {
      label: general.contactPhone,
      href: `tel:${general.contactPhone.replace(/[^\d+]/g, '')}`,
    },
    general.contactEmail && {
      label: general.contactEmail,
      href: `mailto:${general.contactEmail}`,
    },
    general.contactAddress && { label: general.contactAddress, href: '#' },
  ].filter(Boolean) as { label: string; href: string }[];

  const socialLinks = [
    { href: general.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { href: general.social.tiktok, Icon: TikTokIcon, label: 'TikTok' },
    { href: general.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
  ].filter((s) => s.href);

  const footerLinks = [
    {
      title: t('company'),
      links: [
        { label: t('about'), href: '/' },
        { label: t('services'), href: '/#soluciones' },
        { label: t('faq'), href: '/#proyectos' },
        { label: t('contact'), href: '/#faq' },
      ],
    },
    {
      title: t('solutions'),
      links: [
        { label: t('solution_heat'), href: '/productos/calor' },
        { label: t('solution_privacy'), href: '/productos/privacidad' },
        { label: t('solution_acoustic'), href: '/productos/acustica' },
        { label: t('solution_decorative'), href: '/productos/decorativo' },
      ],
    },
    {
      title: t('contact_info'),
      links: contactLinks,
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* 0. Brand */}
      <div className="border-b border-white/10 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Cortina Studio - Inicio"
            className="inline-flex items-center rounded-xl bg-black/90 px-4 py-3"
          >
            <Image
              src="/images/logo/logo_guatemala_cortina_studio_3.png"
              alt="Cortina Studio"
              width={225}
              height={90}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* 1. CTA Strip */}
      <div className="border-b border-white/10 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg">
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                {t('cta_title')}
              </h2>
              <p className="mt-3 text-primary-foreground/60">
                {t('cta_description')}
              </p>
            </div>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:brightness-105 hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t('cta_button')}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Grid */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {footerLinks.map((column) => (
              <div key={column.title} className="last:lg:col-start-4">
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-sm text-primary-foreground/65 transition-colors duration-200 hover:text-accent"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="ml-2 h-px w-0 bg-accent transition-all duration-300 ease-premium group-hover:w-3"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="mt-16 flex items-center gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-primary-foreground transition-all duration-300 ease-premium hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-accent/20 py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-6" />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-primary-foreground/35">
              © {new Date().getFullYear()} {t('copyright_text')}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/privacidad" 
                className="text-xs text-primary-foreground/35 underline-offset-4 transition-colors duration-200 hover:text-primary-foreground/70 hover:underline"
              >
                {t('privacy_link')}
              </Link>
              <Link 
                href="/terminos" 
                className="text-xs text-primary-foreground/35 underline-offset-4 transition-colors duration-200 hover:text-primary-foreground/70 hover:underline"
              >
                {t('terms_link')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
