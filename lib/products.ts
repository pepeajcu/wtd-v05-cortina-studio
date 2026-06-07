import { z } from 'zod';
import productsJson from '@/content/productos.json';

const imagesSchema = z.object({
  hero: z.string().url().nullable(),
  feature: z.string().url().nullable(),
});

const benefitItemSchema = z.object({
  emoji: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const stepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const GALLERY_ASPECTS = ['square', 'portrait', 'landscape', 'wide', 'tall'] as const;
export type GalleryAspect = (typeof GALLERY_ASPECTS)[number];

const galleryItemSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  aspect: z.enum(GALLERY_ASPECTS).default('portrait'),
});

const signatureSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
  highlight: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  specs: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).min(1),
  image: z.string().min(1).nullable(),
});

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  images: imagesSchema,
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  why: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  benefits: z.object({
    title: z.string().min(1),
    items: z.array(benefitItemSchema).min(1),
  }),
  how: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    steps: z.array(stepSchema).min(1),
  }),
  closing: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  signature: signatureSchema,
  gallery: z.array(galleryItemSchema).default([]),
});

export type Product = z.infer<typeof productSchema>;
export type BenefitItem = z.infer<typeof benefitItemSchema>;
export type ProductStep = z.infer<typeof stepSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type ProductSignatureData = z.infer<typeof signatureSchema>;

// Validacion en frontera: si el JSON de contenido esta mal formado, falla aqui
// con un error claro de Zod en lugar de romper silenciosamente aguas abajo.
const PRODUCTS: Product[] = z.array(productSchema).parse(productsJson);

const PRODUCTS_BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

export function getProductBySlug(slug: string): Product | null {
  return PRODUCTS_BY_SLUG.get(slug) ?? null;
}

export function buildProductWhatsAppMessage(name: string): string {
  return `Hola, me interesa el producto "${name}" de Cortina Studio. Quisiera una cotización a la medida.`;
}
