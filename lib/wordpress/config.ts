import { z } from 'zod';
import wpConfigJson from '@/wp-config.json';

const cptSchema = z.object({
  graphqlSingle: z.string().min(1),
  graphqlPlural: z.string().min(1),
  slug: z.string().min(1).optional(),
  orderBy: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

const wpConfigSchema = z.object({
  endpoint: z.string().url(),
  siteUrl: z.string().url(),
  revalidateSeconds: z.number().int().nonnegative(),
  locales: z.object({
    default: z.string().min(2),
    supported: z.array(z.string().min(2)).min(1),
  }),
  cpt: z.object({
    home: cptSchema,
    proyecto: cptSchema,
  }),
  options: z.object({
    general: z.string().min(1),
  }),
  fields: z.object({
    home: z.record(z.string(), z.unknown()),
    proyecto: z.record(z.string(), z.string()),
    general: z.record(z.string(), z.string()),
  }),
  iconMap: z.object({
    problems: z.record(z.string(), z.string()),
    process: z.record(z.string(), z.string()),
  }),
});

export type WpConfig = z.infer<typeof wpConfigSchema>;

function loadConfig(): WpConfig {
  const parsed = wpConfigSchema.safeParse(wpConfigJson);
  if (!parsed.success) {
    console.error('[wp-config] Invalid wp-config.json:', parsed.error.format());
    throw new Error('wp-config.json failed validation. See logs above.');
  }
  return parsed.data;
}

export const wpConfig = loadConfig();
