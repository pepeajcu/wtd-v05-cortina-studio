import type { ReactElement } from 'react';

export interface BrandOgTemplateProps {
  title: string;
  subtitle?: string;
  logoSrc?: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export function BrandOgTemplate({ title, subtitle, logoSrc, colors }: BrandOgTemplateProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} width={72} height={72} style={{ objectFit: 'contain' }} alt="" />
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            width: '96px',
            height: '8px',
            backgroundColor: colors.accent,
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: colors.primary,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
