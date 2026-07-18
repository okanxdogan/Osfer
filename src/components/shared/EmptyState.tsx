"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  delay = 0 
}: { 
  icon: LucideIcon, 
  title: string, 
  description: string, 
  actionLabel?: string, 
  onAction?: () => void,
  delay?: number
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ delay, duration: 0.6, type: "spring", bounce: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 lg:p-12 h-full w-full"
    >
      <div className="w-24 h-24 bg-muted/20 border-2 border-border/40 text-muted-foreground rounded-full flex items-center justify-center mb-6 shadow-sm transition-colors">
         <Icon size={36} strokeWidth={1.5} className="opacity-60" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-3 text-foreground">{title}</h3>
      <p className="text-[15px] font-medium text-muted-foreground leading-relaxed max-w-sm mb-8 opacity-80">{description}</p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-8 py-3 bg-foreground text-background text-sm font-bold uppercase tracking-widest rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ring-offset-background"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
