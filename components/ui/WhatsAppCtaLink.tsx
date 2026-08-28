'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { trackWhatsAppClick, type WhatsAppCtaLocation } from '@/lib/analytics';

interface WhatsAppCtaLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  location: WhatsAppCtaLocation;
  children: ReactNode;
}

/**
 * Envuelve next/link para poder trackear clics en CTAs de WhatsApp desde
 * Server Components: estos no pueden pasar closures (onClick) a Link, que
 * es un Client Component, asi que el tracking vive en este boundary.
 */
export function WhatsAppCtaLink({ href, location, children, ...rest }: WhatsAppCtaLinkProps) {
  return (
    <Link href={href} onClick={() => trackWhatsAppClick(location)} {...rest}>
      {children}
    </Link>
  );
}
