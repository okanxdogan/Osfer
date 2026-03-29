"use client";
import { motion } from "framer-motion";
import React from "react";

export function GlassCard({ children, className = "", delay = 0, onClick, style }: { children: React.ReactNode, className?: string, delay?: number, onClick?: () => void, style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.2 }}
      onClick={onClick}
      style={style}
      className={`bg-card/40 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:bg-card/70 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary' : ''} ${className}`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if(onClick && e.key === 'Enter') onClick(); }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-40 pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
