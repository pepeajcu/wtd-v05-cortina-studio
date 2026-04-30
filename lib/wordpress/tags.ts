export const WP_TAGS = {
  home: 'wp:home',
  proyectos: 'wp:proyectos',
  general: 'wp:general',
} as const;

export type WpTag = (typeof WP_TAGS)[keyof typeof WP_TAGS];

export const ALL_WP_TAGS: readonly WpTag[] = Object.values(WP_TAGS);
