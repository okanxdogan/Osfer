"use client";
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, X, Check, Link as LinkIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

const VIBRANT_COLORS = ['#4f46e5', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#14b8a6', '#a855f7', '#e11d48', '#3b82f6', '#22c55e'];
const pickRandomColor = () => VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];

function getYearDays(): string[] {
  const days: string[] = [];
  const d = new Date(Date.UTC(2026, 0, 1));
  while (d.getUTCFullYear() === 2026) {
    days.push(d.toISOString().split('T')[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

export default function ChainPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground/50">Loading chains...</div>}>
      <ChainContent />
    </Suspense>
  );
}

function ChainContent() {
  const { chains, addChain, deleteChain, setChainDay, clearChainDay } = useGlobalStore();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  const [activeChainId, setActiveChainId] = useState<string>(urlId || chains[0]?.id || '');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChainTitle, setNewChainTitle] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  // Day modal state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayNote, setDayNote] = useState('');

  const activeChain = chains.find(c => c.id === activeChainId);

  useEffect(() => {
    if (urlId && chains.find(c => c.id === urlId)) {
      setActiveChainId(urlId);
    } else if (!activeChainId && chains.length > 0) {
      setActiveChainId(chains[0].id);
    }
  }, [urlId, chains, activeChainId]);

  const yearDays = useMemo(() => {
    if (!activeChain) return [];
    return getYearDays();
  }, [activeChain]);

  const stats = useMemo(() => {
    if (!activeChain) return { completed: 0, total: 365, current: 0, best: 0 };
    const completed = Object.keys(activeChain.days).length;
    // Calculate streaks
    const todayStr = new Date().toISOString().split('T')[0];
    let current = 0;
    let best = 0;
    let streak = 0;
    for (const day of yearDays) {
      if (activeChain.days[day]) {
        streak++;
        if (streak > best) best = streak;
      } else {
        streak = 0;
      }
      if (day === todayStr) current = streak;
    }
    return { completed, total: 365, current, best };
  }, [activeChain, yearDays]);

  const handleCreate = () => {
    if (!newChainTitle.trim()) return;
    addChain(newChainTitle.trim());
    setNewChainTitle('');
    setShowCreateDialog(false);
  };

  // When chains change, auto-select the last added if current is missing
  useEffect(() => {
    if (chains.length > 0 && !chains.find(c => c.id === activeChainId)) {
      setActiveChainId(chains[chains.length - 1].id);
    }
  }, [chains, activeChainId]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    if (activeChain?.days[dateStr]) {
      setDayNote(activeChain.days[dateStr].note);
    } else {
      setDayNote('');
    }
  };

  const handleSaveDay = () => {
    if (!activeChain || !selectedDay || !dayNote.trim()) return;
    setChainDay(activeChain.id, selectedDay, dayNote.trim(), pickRandomColor());
    setSelectedDay(null);
    setDayNote('');
    // Confetti
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 }, colors: VIBRANT_COLORS.slice(0, 6) });
  };

  const handleClearDay = () => {
    if (!activeChain || !selectedDay) return;
    clearChainDay(activeChain.id, selectedDay);
    setSelectedDay(null);
    setDayNote('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      <PageHeader title="Don't Break The Chain" description="365-day consistency tracker. Every completed day is a link in your chain." />

      {/* Chain selector bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {chains.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/40 rounded-xl text-sm font-semibold hover:bg-card/80 transition-colors"
            >
              <motion.span whileHover={{ scale: 1.05 }} className="origin-left flex items-center gap-2">
                {activeChain?.title || 'Select chain'} <ChevronDown size={14} className="text-muted-foreground" />
              </motion.span>
            </button>
            {showSelector && (
              <div className="absolute left-0 top-12 z-20 bg-card border border-border/50 rounded-xl shadow-xl py-1.5 min-w-[220px]">
                {chains.map(c => (
                  <button key={c.id} onClick={() => { setActiveChainId(c.id); setShowSelector(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/30 transition-colors ${c.id === activeChainId ? 'text-primary' : ''}`}>
                    <span className="truncate">{c.title}</span>
                    <button onClick={e => { e.stopPropagation(); deleteChain(c.id); if (c.id === activeChainId && chains.length > 1) setActiveChainId(chains.find(x => x.id !== c.id)?.id || ''); setShowSelector(false); }}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
          <Plus size={15} /> <motion.span whileHover={{ scale: 1.1 }}>New Chain</motion.span>
        </button>
      </div>

      {/* Create dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Create a New Chain</h3>
              <p className="text-sm text-muted-foreground mb-6">A 365-day consistency tracker will be generated automatically.</p>
              <input autoFocus type="text" placeholder="Chain name (e.g. Read 20 Pages Daily)" value={newChainTitle} onChange={e => setNewChainTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-sm font-medium mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowCreateDialog(false)} className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-medium hover:bg-muted/20 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day note modal */}
      <AnimatePresence>
        {selectedDay && activeChain && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border/50 rounded-2xl p-7 max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold">{selectedDay}</h3>
                <button onClick={() => setSelectedDay(null)} className="p-1.5 hover:bg-muted/40 rounded-lg"><X size={16} /></button>
              </div>
              <textarea
                autoFocus
                placeholder="What did you accomplish? (e.g. 35 sayfa kitap okundu)"
                value={dayNote}
                onChange={e => setDayNote(e.target.value)}
                rows={3}
                className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-sm font-medium resize-none mb-4"
              />
              <div className="flex gap-3">
                {activeChain.days[selectedDay] && (
                  <button onClick={handleClearDay} className="px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">Clear</button>
                )}
                <button onClick={handleSaveDay} disabled={!dayNote.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                  <Check size={16} /> Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {chains.length === 0 && (
        <GlassCard className="flex-1 min-h-[460px]">
          <div className="flex flex-col items-center justify-center text-center p-12 h-full w-full">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
              <LinkIcon size={32} strokeWidth={1.5} className="text-primary" />
            </div>
            <motion.h2 whileHover={{ scale: 1.05 }} className="text-3xl font-bold mb-6 tracking-tight origin-center cursor-default">Start Your First Chain</motion.h2>
            <button onClick={() => setShowCreateDialog(true)} className="px-8 py-4 bg-primary text-primary-foreground text-[15px] font-bold rounded-2xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 mb-8">
              Create Custom Chain
            </button>
            <motion.p whileHover={{ scale: 1.02 }} className="text-sm text-muted-foreground/50 max-w-sm leading-relaxed font-medium mx-auto cursor-default">
              Create a 365-day chain to track any habit or goal. Each day you complete adds a colorful link to your chain.
            </motion.p>
          </div>
        </GlassCard>
      )}

      {/* 365-day poster grid */}
      {activeChain && (
        <div className="flex flex-col gap-6">
          {/* Stats bar */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <motion.span whileHover={{ scale: 1.1 }} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 cursor-default">Completed</motion.span>
              <motion.span whileHover={{ scale: 1.15 }} className="text-lg font-bold tabular-nums cursor-default">{stats.completed}</motion.span>
            </div>
            <div className="w-[1px] h-6 bg-border/40" />
            <div className="flex items-center gap-2">
              <motion.span whileHover={{ scale: 1.1 }} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 cursor-default">Current Streak</motion.span>
              <motion.span whileHover={{ scale: 1.15 }} className="text-lg font-bold tabular-nums text-orange-500 cursor-default">{stats.current}</motion.span>
            </div>
            <div className="w-[1px] h-6 bg-border/40" />
            <div className="flex items-center gap-2">
              <motion.span whileHover={{ scale: 1.1 }} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 cursor-default">Best</motion.span>
              <motion.span whileHover={{ scale: 1.15 }} className="text-lg font-bold tabular-nums text-yellow-500 cursor-default">{stats.best}</motion.span>
            </div>
          </div>

          {/* The poster grid — flows like a winding chain poster */}
          <GlassCard className="p-5 md:p-8 overflow-x-auto">
            <div className="grid gap-[6px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))' }}>
              {yearDays.map((dayStr, i) => {
                const entry = activeChain.days[dayStr];
                const isToday = dayStr === todayStr;
                const d = new Date(dayStr);
                const dayNum = d.getDate();
                const isFirstOfMonth = dayNum === 1;

                let prevEntry = null;
                if (i > 0) {
                  prevEntry = activeChain.days[yearDays[i - 1]];
                }

                return (
                  <React.Fragment key={dayStr}>
                    {isFirstOfMonth && i > 0 && (
                      <div className="col-span-full h-0" />
                    )}
                    {isFirstOfMonth && (
                      <motion.div whileHover={{ scale: 1.05 }} className="col-span-full text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 pt-3 pb-1 origin-left cursor-default">
                        {d.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                      </motion.div>
                    )}
                    <motion.button
                      onClick={() => handleDayClick(dayStr)}
                      whileHover={{ scale: 1.25, zIndex: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className={`aspect-square rounded-[6px] flex items-center justify-center text-[10px] font-bold transition-all relative ${
                        entry
                          ? 'text-white shadow-sm z-10'
                          : isToday
                            ? 'bg-muted/30 border-2 border-primary/50 text-primary z-0'
                            : 'bg-muted/10 border border-border/20 text-muted-foreground/30 hover:bg-muted/30 hover:text-muted-foreground/60 z-0'
                      }`}
                      style={entry ? { backgroundColor: entry.color } : undefined}
                      title={entry ? `${dayStr}: ${entry.note}` : dayStr}
                    >
                      {entry && prevEntry && !isFirstOfMonth && (
                        <div 
                          className="absolute top-1/2 right-full w-[6px] h-[3px] -translate-y-1/2 pointer-events-none rounded-sm" 
                          style={{ backgroundColor: prevEntry.color, opacity: 0.8 }} 
                        />
                      )}
                      <span className="relative z-10">{dayNum}</span>
                    </motion.button>
                  </React.Fragment>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
