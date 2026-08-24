'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

interface WhatsAppFloatingCtaProps {
  whatsappNumber: string;
}

export function WhatsAppFloatingCta({ whatsappNumber }: WhatsAppFloatingCtaProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');

  return (
    <>
      {/* Mobile: barra sticky inferior */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/70 to-transparent"
        />
        <div className="relative flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('cta_contact')}
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-border/40 bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-strong backdrop-blur-xl transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <WhatsAppIcon className="h-3.5 w-3.5" />
            </span>
            {t('cta_contact')}
          </Link>
        </div>
      </div>

      {/* Tablet / Desktop: burbuja circular flotante */}
      <div className="fixed bottom-6 left-6 z-30 hidden md:block">
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tCommon('whatsapp')}
          title={tCommon('whatsapp')}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-primary text-primary-foreground shadow-strong transition-all duration-300 ease-premium hover:scale-105 hover:shadow-[0_8px_32px_-4px_rgb(0_0_0_/_0.25)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <WhatsAppIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </Link>
      </div>
    </>
  );
}
