'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const t = useTranslations('nav');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('home'), href: '/' },
    { label: t('services'), href: '/servicios' },
    { label: t('products'), href: '/productos' },
    { label: t('about'), href: '/nosotros' },
    { label: t('contact'), href: '/contacto' },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-6 pt-6">
      <header
        className={cn(
          'flex items-center justify-between gap-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isScrolled 
            ? 'w-full max-w-7xl h-16 rounded-full bg-background/80 backdrop-blur-xl border border-border/40 shadow-soft px-6' 
            : 'w-max h-16 rounded-full bg-background/40 backdrop-blur-md border border-white/20 px-8'
        )}
      >
        {/* Logo - Left */}
        <Link 
          href="/" 
          className="font-sans text-lg font-semibold tracking-tight text-foreground flex items-center"
        >
          Cortina<span className="text-accent ml-1"> Studio</span>
        </Link>

        {/* Nav - Center (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-foreground/60 transition-colors duration-300 hover:text-foreground"
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        {/* CTA - Right (Desktop) */}
        <div className="hidden md:block">
          <Link
            href="/contacto"
            className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 active:scale-[0.98] hover:shadow-medium"
          >
            {t('cta_contact')}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110">
              <ArrowRight className="h-3 w-3" />
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
            className="fixed inset-0 top-0 z-40 flex flex-col items-center justify-center bg-background/95 backdrop-blur-3xl p-6 md:hidden"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-2"
            >
              <X className="h-8 w-8 text-foreground" />
            </button>
            
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
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
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4"
              >
                <Link
                  href="/contacto"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg"
                >
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
