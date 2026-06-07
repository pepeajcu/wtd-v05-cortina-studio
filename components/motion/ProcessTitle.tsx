'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface WordEntry {
  text: string;
  gender: 'm' | 'f';
}

interface ProcessTitleProps {
  words: WordEntry[];
  prefixM: string;
  prefixF: string;
  suffix: string;
  intervalMs?: number;
  className?: string;
  id?: string;
}

export function ProcessTitle({
  words,
  prefixM,
  prefixF,
  suffix,
  intervalMs = 2500,
  className,
  id,
}: ProcessTitleProps) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs, reduced]);

  if (reduced) {
    const firstWord = words[0];
    const prefix = firstWord.gender === 'm' ? prefixM : prefixF;
    return (
      <h2
        id={id}
        className={cn(
          'flex flex-col items-center justify-center gap-y-1 lg:flex-row lg:gap-x-2 lg:gap-y-0 lg:whitespace-nowrap',
          className,
        )}
      >
        <span className="flex items-center justify-center gap-x-2">
          <span>{prefix}</span>
          <span className="font-display italic text-accent">{firstWord.text}</span>
        </span>
        <span>{suffix}</span>
      </h2>
    );
  }

  const currentWord = words[index];
  const currentPrefix = currentWord.gender === 'm' ? prefixM : prefixF;

  return (
    <h2
      id={id}
      className={cn(
        'flex flex-col items-center justify-center gap-y-1 lg:flex-row lg:gap-x-2 lg:gap-y-0 lg:whitespace-nowrap',
        className,
      )}
    >
      <span className="flex items-center justify-center gap-x-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentPrefix}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentPrefix}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display italic text-accent"
          >
            {currentWord.text}
          </motion.span>
        </AnimatePresence>
      </span>

      <span>{suffix}</span>
    </h2>
  );
}
