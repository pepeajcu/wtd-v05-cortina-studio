'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function FadeInStagger({
  children,
  className,
  stagger = 0.1,
}: FadeInStaggerProps) {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
      },
    },
  };

  const item = {
    hidden: { 
      opacity: 0, 
      y: reduced ? 0 : 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: reduced ? 0.2 : 0.5, 
        ease: [0.22, 1, 0.36, 1] as any 
      },
    },
  };


  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-64px' }}
      className={cn('will-change-transform', className)}
    >
      {/* 
          We map children to ensure they are motion components. 
          The children passed to FadeInStagger should be wrapped in motion.div 
          or we can wrap them here.
      */}
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div variants={item} key={index}>
              {child}
            </motion.div>
          ))
        : (
            <motion.div variants={item}>
              {children}
            </motion.div>
          )
      }
    </motion.div>
  );
}
