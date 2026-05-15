import { z } from 'zod';
import { wpFetch } from './client';
import { WP_TAGS } from './tags';
import { GetGeneralDocument, type GetGeneralQuery } from '@/lib/graphql/generated';

const navItemRawSchema = z.object({
  nav_items_label: z.string().default(''),
  nav_items_url: z.string().default(''),
  nav_items_order: z.coerce.number().default(0),
});

const navItemsRecordSchema = z
  .record(z.string(), navItemRawSchema)
  .transform((record) =>
    Object.values(record)
      .map((item) => ({
        label: item.nav_items_label,
        url: item.nav_items_url,
        order: item.nav_items_order,
      }))
      .sort((a, b) => a.order - b.order),
  );

export type NavItemData = { label: string; url: string; order: number };

export interface GeneralData {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
  };
  brand: {
    name: string;
    logo: string | null;
  };
  footer: {
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    copyright: string;
  };
  navItems: NavItemData[];
}

function parseNavItems(raw: string | null | undefined): NavItemData[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) {
    return navItemsRecordSchema.parse(
      Object.fromEntries(parsed.map((item, i) => [`item-${i}`, item])),
    );
  }
  if (parsed && typeof parsed === 'object') {
    return navItemsRecordSchema.parse(parsed);
  }
  return [];
}

export async function getGeneral(): Promise<GeneralData> {
  const data = await wpFetch<GetGeneralQuery>(GetGeneralDocument, undefined, {
    tags: [WP_TAGS.general],
  });

  const g = data.general ?? {};

  return {
    whatsappNumber: g.whatsappNumber ?? '',
    whatsappDefaultMessage: g.whatsappDefaultMessage ?? '',
    contactPhone: g.contactPhone ?? '',
    contactEmail: g.contactEmail ?? '',
    contactAddress: g.contactAddress ?? '',
    social: {
      instagram: g.socialInstagram ?? '',
      tiktok: g.socialTiktok ?? '',
      facebook: g.socialFacebook ?? '',
    },
    brand: {
      name: g.brandName ?? '',
      logo: g.brandLogo ?? null,
    },
    footer: {
      ctaTitle: g.footerCtaTitle ?? '',
      ctaDescription: g.footerCtaDescription ?? '',
      ctaButton: g.footerCtaButton ?? '',
      copyright: g.footerCopyright ?? '',
    },
    navItems: parseNavItems(g.navItems),
  };
}
