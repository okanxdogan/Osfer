"use client";
import { motion } from 'framer-motion';

export function PageHeader({ title, description }: { title: string, description?: string }) {
  return (
    <div className="mb-6 border-b border-white/5 pb-5">
      <motion.h1 whileHover={{ scale: 1.02 }} className="text-2xl md:text-3xl font-black tracking-tighter mb-1.5 text-white bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent origin-left cursor-default">
        {title}
      </motion.h1>
      {description && <motion.p whileHover={{ scale: 1.01 }} className="text-[13px] font-medium text-white/40 tracking-tight leading-relaxed max-w-xl origin-left cursor-default">{description}</motion.p>}
    </div>
  );
}
