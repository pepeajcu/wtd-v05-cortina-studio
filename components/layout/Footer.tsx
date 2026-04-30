'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Circle, Square, Triangle } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  const footerLinks = [
    {
      title: t('company'),
      links: [
        { label: t('about'), href: '/nosotros' },
        { label: t('services'), href: '/servicios' },
        { label: t('faq'), href: '/faq' },
        { label: t('contact'), href: '/contacto' },
      ],
    },
    {
      title: t('products'),
      links: [
        { label: t('ripplefold'), href: '/productos/ripplefold' },
        { label: t('enrollables'), href: '/productos/enrollables' },
        { label: t('pliegue_frances'), href: '/productos/pliegue-frances' },
        { label: t('cenefas'), href: '/productos/cenefas' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy_policy'), href: '/privacidad' },
        { label: t('terms_conditions'), href: '/terminos' },
        { label: t('cookies'), href: '/cookies' },
      ],
    },
    {
      title: t('contact_info'),
      links: [
        { label: t('phone'), href: 'tel:+502XXXXXXXX' },
        { label: t('email'), href: 'mailto:info@cortinastudio.com.gt' },
        { label: t('address'), href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
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
              href="/contacto"
              className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-medium transition-all duration-300 ease-premium hover:brightness-105 hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0"
            >
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
              <div key={column.title}>
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
          <div className="mt-16 flex items-center gap-4">
            {[
              { Icon: Circle, href: '#' },
              { Icon: Square, href: '#' },
              { Icon: Triangle, href: '#' },
            ].map(({ Icon, href }, i) => (
              <Link
                key={i}
                href={href}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-primary-foreground transition-all duration-300 ease-premium hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-accent/20 py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-6" />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-primary-foreground/35">
              © {new Date().getFullYear()} {t('copyright_text')}. All rights reserved.
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
