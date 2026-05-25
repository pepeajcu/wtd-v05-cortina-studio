import { wpFetch } from './client';
import { WP_TAGS } from './tags';
import { GetGeneralDocument, type GetGeneralQuery } from '@/lib/graphql/generated';

export interface GeneralData {
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
  };
  brand: {
    logo: string | null;
  };
}

export async function getGeneral(): Promise<GeneralData> {
  const data = await wpFetch<GetGeneralQuery>(GetGeneralDocument, undefined, {
    tags: [WP_TAGS.general],
  });

  const g = data.general ?? {};

  return {
    whatsappNumber: g.whatsappNumber ?? '',
    contactPhone: g.contactPhone ?? '',
    contactEmail: g.contactEmail ?? '',
    contactAddress: g.contactAddress ?? '',
    social: {
      instagram: g.socialInstagram ?? '',
      tiktok: g.socialTiktok ?? '',
      facebook: g.socialFacebook ?? '',
    },
    brand: {
      logo: g.brandLogo ?? null,
    },
  };
}
