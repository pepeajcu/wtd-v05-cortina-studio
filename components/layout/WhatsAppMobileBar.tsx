'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buildWhatsAppUrl } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

interface WhatsAppMobileBarProps {
  whatsappNumber: string;
}

export function WhatsAppMobileBar({ whatsappNumber }: WhatsAppMobileBarProps) {
  const t = useTranslations('nav');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');

  return (
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
  );
}
