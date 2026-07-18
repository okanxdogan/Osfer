"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGlobalStore } from "@/lib/store/GlobalStore";
import { StudyBlockCard } from "@/components/modules/study/StudyBlockCard";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyPage() {
  const { studyBlocks, addStudyBlock } = useGlobalStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) { setIsCreating(false); return; }
    const colors = ['#4f46e5', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
    addStudyBlock(newTitle, colors[studyBlocks.length % colors.length]);
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <PageHeader title="Study" description="Organize deep work into focused study blocks." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <AnimatePresence>
          {studyBlocks.map((block, i) => (
            <StudyBlockCard key={block.id} block={block} delay={i * 0.08} />
          ))}
        </AnimatePresence>

        {isCreating ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
            <GlassCard className="border-t-[6px] border-t-primary/40 h-full">
              <div className="p-7 w-full h-full min-h-[280px] flex flex-col items-center justify-center">
                <form onSubmit={handleCreate} className="w-full max-w-[280px] flex flex-col items-center">
                  <h3 className="text-base font-semibold mb-5 text-foreground/80">New Study</h3>
                  <input
                    autoFocus type="text" placeholder="Block title (e.g. History 101)"
                    className="w-full bg-muted/20 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground font-semibold text-center"
                    value={newTitle} onChange={e => setNewTitle(e.target.value)} onBlur={handleCreate}
                  />
                  <button type="submit" className="mt-4 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all hover:brightness-110">Create Block</button>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <GlassCard
            delay={studyBlocks.length * 0.08}
            onClick={() => setIsCreating(true)}
            className="h-full border-dashed border-2 border-border/30 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all group"
          >
            <div className="p-6 w-full h-full min-h-[280px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted/15 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/30 rounded-full flex items-center justify-center mb-5 transition-all">
                <Plus size={28} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-base font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors">New Study</p>
              {studyBlocks.length === 0 && (
                <p className="text-sm text-muted-foreground/40 mt-2 max-w-[200px] leading-relaxed">Create your first study block to get started.</p>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
