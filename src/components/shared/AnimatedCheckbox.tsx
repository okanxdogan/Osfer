"use client";
import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedCheckbox({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <motion.button
      type="button"
      className={`flex items-center justify-center min-w-8 w-8 h-8 rounded-full border-[2.5px] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${checked ? 'bg-primary border-primary hover:bg-primary/90' : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5'}`}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      whileTap={{ scale: 0.85 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground w-3 h-3"
        initial={false}
        animate={checked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.polyline points="20 6 9 17 4 12" />
      </motion.svg>
    </motion.button>
  );
}
