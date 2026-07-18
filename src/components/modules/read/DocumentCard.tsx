import React from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { ReadingDocument } from '@/lib/store/types';
import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';

export function DocumentCard({ doc, delay, onClick, onDelete }: { doc: ReadingDocument, delay: number, onClick: () => void, onDelete: () => void }) {
  const progress = doc.totalPages > 0 ? (doc.currentPage / doc.totalPages) * 100 : 0;

  return (
    <GlassCard
      delay={delay}
      onClick={onClick}
      className="flex flex-col h-[17rem] overflow-hidden group cursor-pointer hover:border-primary/30 transition-all hover:-translate-y-1"
    >
      <motion.div whileHover="hover" className="flex flex-col h-full w-full">
        <div className="h-28 w-full p-4 flex flex-col justify-between relative" style={{ backgroundColor: doc.coverColor }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
          <div className="relative z-10 flex justify-between items-start text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
              <FileText size={14} strokeWidth={2.5} />
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/20 rounded-full"
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Remove document"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <motion.h3 
            variants={{ hover: { scale: 1.05 } }}
            className="relative z-10 text-white font-bold leading-snug text-[15px] line-clamp-2 pr-2 drop-shadow-sm origin-left cursor-default"
          >
            {doc.title}
          </motion.h3>
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between bg-card/40 backdrop-blur-sm border-t border-white/5">
          <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-muted-foreground/50">
            <motion.span 
              variants={{ hover: { scale: 1.1, color: 'var(--primary)' } }}
              className={`${doc.currentPage > 1 ? 'text-primary' : ''} transition-colors cursor-default`}
            >
              {doc.currentPage > 1 ? 'Reading' : 'New'}
            </motion.span>
            <motion.span variants={{ hover: { scale: 1.1 } }} className="cursor-default">{doc.totalPages}p</motion.span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] mb-2 text-muted-foreground/40">
              <motion.span variants={{ hover: { scale: 1.05 } }} className="cursor-default">Progress</motion.span>
              <motion.span variants={{ hover: { scale: 1.1 } }} className="cursor-default">{Math.round(progress)}%</motion.span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden ring-1 ring-inset ring-black/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" transition={{ duration: 0.6 }} />
            </div>
          </div>
        </div>
      </motion.div>
    </GlassCard>
  );
}
