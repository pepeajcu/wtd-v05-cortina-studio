'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { cn, buildWhatsAppUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '@/lib/iconMap';

export interface HeaderProductLink {
  label: string;
  href: string;
}

interface HeaderProps {
  products: HeaderProductLink[];
  whatsappNumber: string;
}

const PRODUCTS_CLOSE_DELAY = 150;

export function Header({ products, whatsappNumber }: HeaderProps) {
  const t = useTranslations('nav');
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, t('cta_whatsapp_message'));
  const WhatsAppIcon = getIcon('whatsapp');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, PRODUCTS_CLOSE_DELAY);
  }, [cancelClose]);

  const openProducts = useCallback(() => {
    cancelClose();
    setIsProductsOpen(true);
  }, [cancelClose]);

  useEffect(() => {
    if (!isProductsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProductsOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [isProductsOpen]);

  const navLinks = [
    { label: t('home'), href: '/' },
    { label: t('solutions'), href: '/#soluciones' },
    { label: t('products'), href: '/productos', isProducts: true },
    { label: t('about'), href: '/#proyectos', hideOnTablet: true },
    { label: t('contact'), href: '/#faq' },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-6 pt-6">
      <header
        className={cn(
          'flex items-center justify-between gap-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isScrolled
            ? 'w-full max-w-7xl h-16 rounded-full bg-background/80 backdrop-blur-xl border border-border/40 shadow-soft px-6'
            : 'w-max h-16 rounded-full bg-background/40 backdrop-blur-md border border-white/20 px-8',
        )}
      >
        {/* Logo - Left */}
        <Link
          href="/"
          aria-label="Cortina Studio - Inicio"
          className="flex items-center rounded-3xl bg-black/90 px-3 py-2"
        >
          <Image
            src="/images/logo/logo_guatemala_cortina_studio_3.png"
            alt="Cortina Studio"
            width={225}
            height={90}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Nav - Center (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if ('isProducts' in link && link.isProducts) {
              return (
                <div
                  key={link.href}
                  ref={productsRef}
                  className="relative"
                  onMouseEnter={openProducts}
                  onMouseLeave={scheduleClose}
                  onFocus={openProducts}
                  onBlur={scheduleClose}
                >
                  <button
                    type="button"
                    aria-expanded={isProductsOpen}
                    aria-haspopup="menu"
                    aria-controls="products-menu"
                    onClick={() => setIsProductsOpen(true)}
                    className={cn(
                      'group relative inline-flex items-center gap-1 text-sm font-medium',
                      'text-foreground/60 transition-colors duration-300 hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full',
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-500 ease-premium',
                        isProductsOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-1 left-0 h-px bg-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        isProductsOpen ? 'w-full' : 'w-0 group-hover:w-full',
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isProductsOpen && (
                      <motion.div
                        id="products-menu"
                        role="menu"
                        aria-label={t('products')}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          'w-[min(92vw,560px)] rounded-2xl',
                          'bg-background/95 backdrop-blur-2xl',
                          'border border-border/50 shadow-strong',
                          'p-2',
                          'fixed left-1/2 top-24 -translate-x-1/2',
                        )}
                        onMouseEnter={openProducts}
                        onMouseLeave={scheduleClose}
                      >
                        <ul
                          role="none"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-1"
                        >
                          {products.map((product) => (
                            <li key={product.href} role="none">
                              <Link
                                role="menuitem"
                                href={product.href}
                                onClick={() => setIsProductsOpen(false)}
                                className={cn(
                                  'group/item flex items-center justify-between gap-3 rounded-xl px-4 py-3',
                                  'text-sm font-medium text-foreground/75',
                                  'transition-all duration-300 ease-premium',
                                  'hover:bg-secondary/40 hover:text-foreground hover:translate-x-0.5',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                                )}
                              >
                                <span className="leading-tight">{product.label}</span>
                                <ArrowRight
                                  className={cn(
                                    'h-3.5 w-3.5 text-foreground/30 transition-all duration-300 ease-premium',
                                    'group-hover/item:text-accent group-hover/item:translate-x-0.5',
                                  )}
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group relative text-sm font-medium text-foreground/60 transition-colors duration-300 hover:text-foreground',
                  'hideOnTablet' in link && link.hideOnTablet && 'max-lg:hidden',
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-full"
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA - Right (Desktop) */}
        <div className="hidden md:block">
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-gtm-event="click_whatsapp"
            data-gtm-location="header"
            className="group relative inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 active:scale-[0.98] hover:shadow-medium"
          >
            {t('cta_contact')}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
              <WhatsAppIcon className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-foreground"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? t('close_menu') : t('open_menu')}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 top-0 z-40 flex flex-col items-center bg-background/95 backdrop-blur-3xl p-6 md:hidden overflow-y-auto"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-2"
              aria-label={t('close_menu')}
            >
              <X className="h-8 w-8 text-foreground" />
            </button>

            <nav className="flex flex-col items-center gap-7 mt-24 mb-10 w-full max-w-sm">
              {navLinks.map((link, i) => {
                if ('isProducts' in link && link.isProducts) {
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="w-full flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={() => setIsMobileProductsOpen((v) => !v)}
                        aria-expanded={isMobileProductsOpen}
                        aria-controls="mobile-products-list"
                        className="inline-flex items-center gap-2 text-3xl font-sans font-semibold text-foreground hover:text-accent transition-colors"
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            'h-6 w-6 transition-transform duration-500 ease-premium',
                            isMobileProductsOpen && 'rotate-180',
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isMobileProductsOpen && (
                          <motion.ul
                            id="mobile-products-list"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden w-full"
                          >
                            <div className="mt-5 grid grid-cols-1 gap-1 w-full px-4">
                              {products.map((product) => (
                                <li key={product.href}>
                                  <Link
                                    href={product.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-foreground/75 transition-colors hover:bg-secondary/40 hover:text-foreground"
                                  >
                                    <span>{product.label}</span>
                                    <ArrowRight
                                      className="h-4 w-4 text-foreground/40"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                </li>
                              ))}
                            </div>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-3xl font-sans font-semibold text-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4"
              >
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-gtm-event="click_whatsapp"
                  data-gtm-location="header_mobile"
                  className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t('cta_contact')}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
