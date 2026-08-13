import { JsonLd } from './JsonLd';

export interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string | null;
  sameAs?: string[];
}

export function OrganizationSchema({ name, url, logo, sameAs = [] }: OrganizationSchemaProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        ...(logo ? { logo } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}
