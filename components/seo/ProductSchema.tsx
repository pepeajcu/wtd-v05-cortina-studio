import { JsonLd } from './JsonLd';

export interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string | null;
  url: string;
}

export function ProductSchema({ name, description, image, url }: ProductSchemaProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        url,
        ...(image ? { image } : {}),
      }}
    />
  );
}
