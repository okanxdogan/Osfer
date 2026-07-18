"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGlobalStore } from "@/lib/store/GlobalStore";
import { WisdomQuoteCard } from "@/components/modules/wisdom/WisdomQuoteCard";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function WisdomPage() {
  const { wisdomQuotes, addWisdomQuote } = useGlobalStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newSource, setNewSource] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    
    const author = newAuthor.trim() || 'Unknown';
    const source = newSource.trim();
    const colors = ['#4f46e5', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#6366f1'];
    
    addWisdomQuote(
      newQuote.trim(), 
      author, 
      source, 
      colors[wisdomQuotes.length % colors.length]
    );
    
    setNewQuote('');
    setNewAuthor('');
    setNewSource('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <PageHeader title="Wisdom" description="Words of wisdom, quotes, and motivation to keep you inspired." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <AnimatePresence>
          {wisdomQuotes.map((quote, i) => (
            <WisdomQuoteCard key={quote.id} quote={quote} delay={i * 0.08} />
          ))}
        </AnimatePresence>

        {isCreating ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
            <GlassCard className="border-t-[6px] border-t-primary/40 h-full">
              <div className="p-7 w-full h-full min-h-[280px] flex flex-col items-center justify-center">
                <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
                  <h3 className="text-base font-semibold mb-2 text-foreground/80 text-center">New Quote</h3>
                  
                  <textarea
                    autoFocus
                    placeholder="Enter the quote..."
                    className="w-full bg-muted/20 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground font-medium resize-none"
                    rows={4}
                    value={newQuote}
                    onChange={e => setNewQuote(e.target.value)}
                  />
                  
                  <input
                    type="text" 
                    placeholder="Author (e.g. Marcus Aurelius)"
                    className="w-full bg-muted/20 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground text-sm"
                    value={newAuthor} 
                    onChange={e => setNewAuthor(e.target.value)}
                  />
                  
                  <input
                    type="text" 
                    placeholder="Source (e.g. Meditations) - Optional"
                    className="w-full bg-muted/20 border border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground text-sm"
                    value={newSource} 
                    onChange={e => setNewSource(e.target.value)}
                  />

                  <div className="flex gap-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsCreating(false)}
                      className="flex-1 bg-muted text-foreground font-semibold py-3 rounded-xl transition-all hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={!newQuote.trim()}
                      className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <GlassCard
            delay={wisdomQuotes.length * 0.08}
            onClick={() => setIsCreating(true)}
            className="h-full border-dashed border-2 border-border/30 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all group"
          >
            <div className="p-6 w-full h-full min-h-[280px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted/15 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/30 rounded-full flex items-center justify-center mb-5 transition-all">
                <Plus size={28} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-base font-semibold text-foreground/70 group-hover:text-foreground/90 transition-colors">Add Quote</p>
              {wisdomQuotes.length === 0 && (
                <p className="text-sm text-muted-foreground/40 mt-2 max-w-[200px] leading-relaxed">Add your favorite quotes and passages to stay inspired.</p>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
