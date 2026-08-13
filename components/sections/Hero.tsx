'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildWhatsAppUrl } from '@/lib/utils';

interface HeroProps {
  image: string | null;
  imageCaption: string;
  whatsappNumber: string;
}

export function Hero({ image, imageCaption, whatsappNumber }: HeroProps) {
  const t = useTranslations('hero');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-background py-24 lg:py-32">
      {/* Subtle Background Texture - Editorial Luxury */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: High-End Image Container (Double-Bezel) */}
          <motion.div
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* Outer Shell */}
            <div className="relative p-2 rounded-[2.5rem] bg-secondary/20 border border-border/40 shadow-soft">
              {/* Inner Core */}
              <div className="relative overflow-hidden rounded-[calc(2.5rem-0.5rem)] bg-muted aspect-[4/5] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={t('title')}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary/20 flex items-center justify-center text-primary-foreground/20 font-display italic text-2xl">
                    [ Imagen Premium de Cortinas ]
                  </div>
                )}
              </div>
            </div>

            {/* Floating Detail Card */}
            {imageCaption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-background/90 backdrop-blur-xl border border-border shadow-medium hidden sm:block max-w-[200px]"
              >
                <p className="text-xs font-medium text-foreground/60 leading-relaxed">
                  {imageCaption}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right Side: Editorial Typography */}
          <div className="flex flex-col items-start text-left order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="mb-4"
            >
              <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-accent/10 text-accent border border-accent/20">
                {t('eyebrow')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="text-4xl lg:text-6xl xl:text-7xl font-sans font-semibold leading-[1.1] tracking-tight text-foreground text-balance"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mt-6 text-lg lg:text-xl font-display italic leading-relaxed text-foreground/60 max-w-xl"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mt-10"
            >
              <Link
                href={whatsappUrl}
                target="_blank"
                data-gtm-event="click_whatsapp"
                data-gtm-location="hero"
                className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-medium transition-all duration-300 active:scale-[0.98] hover:shadow-strong"
              >
                {t('cta_label')}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
                  <MessageCircle className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="mt-10 flex items-stretch divide-x divide-border/40"
            >
              {([
                { value: t('fact_1_value'), label: t('fact_1_label') },
                { value: t('fact_2_value'), label: t('fact_2_label') },
                { value: t('fact_3_value'), label: t('fact_3_label') },
              ] as const).map((fact) => (
                <div key={fact.label} className="flex flex-col px-6 first:pl-0 last:pr-0">
                  <span className="text-2xl font-semibold text-foreground tracking-tight leading-none">
                    {fact.value}
                  </span>
                  <span className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                    {fact.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
