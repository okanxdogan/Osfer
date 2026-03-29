"use client";
import React, { useMemo } from 'react';
import { GlassCard } from "@/components/shared/GlassCard";
import { Clock, CheckCircle2, Flame, Link as LinkIcon, BookOpen, Layers, RotateCcw, AlertTriangle, Plus } from 'lucide-react';
import { useGlobalStore } from "@/lib/store/GlobalStore";
import { InlineEditor } from "@/components/shared/InlineEditor";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function getYearDays(): string[] {
  const days: string[] = [];
  const d = new Date(Date.UTC(2026, 0, 1));
  while (d.getUTCFullYear() === 2026) {
    days.push(d.toISOString().split('T')[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

export default function Home() {
  const { profile, updateProfile, tasks, chains, studyBlocks, documents, resetFocusTime, addChain } = useGlobalStore();
  const [showResetModal, setShowResetModal] = React.useState(false);
  const [isAddingChain, setIsAddingChain] = React.useState(false);
  const [newChainTitle, setNewChainTitle] = React.useState('');

  const handleCreateChain = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChainTitle.trim()) {
      addChain(newChainTitle.trim());
      setNewChainTitle('');
      setIsAddingChain(false);
    }
  };

  // ── Derived metrics from real data ──
  const activePlans = tasks.filter(t => t.status === 'todo').length;
  const completedToday = tasks.filter(t => t.scope === 'daily' && t.status === 'completed').length;
  const totalToday = tasks.filter(t => t.scope === 'daily').length;
  const focusMinutes = profile.totalFocusMinutes;
  const upcomingTasks = tasks.filter(t => t.status === 'todo');

  // Study summary
  const totalStudyTasks = studyBlocks.reduce((acc, b) => acc + b.tasks.length, 0);
  const completedStudyTasks = studyBlocks.reduce((acc, b) => acc + b.tasks.filter(t => t.status === 'completed').length, 0);

  // Chain streaks computed from real chain data
  const chainSummaries = useMemo(() => {
    const yearDays = getYearDays();
    return chains.map(chain => {
      const todayStr = new Date().toISOString().split('T')[0];
      const completed = Object.keys(chain.days).length;
      let current = 0;
      let best = 0;
      let streak = 0;
      for (const day of yearDays) {
        if (chain.days[day]) {
          streak++;
          if (streak > best) best = streak;
        } else {
          streak = 0;
        }
        if (day === todayStr) current = streak;
      }
      return { id: chain.id, title: chain.title, completed, current, best };
    });
  }, [chains]);

  const hasName = profile.name.trim().length > 0;

  return (
    <>
    <div className="flex flex-col gap-7 h-full pb-10">
      {/* Greeting */}
      <div className="pt-2 pb-6 border-b border-border/30 flex items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground flex items-center gap-3 flex-wrap min-w-0">
            {hasName ? (
              <motion.span whileHover={{ scale: 1.05 }} className="inline-block origin-left pb-1 break-all">
                Welcome back, <span className="text-primary">{profile.name}</span>
              </motion.span>
            ) : (
              <motion.span whileHover={{ scale: 1.05 }} className="inline-block origin-left pb-1 break-all">
                Welcome to <span className="text-primary">{profile.appName || 'Osfer'}</span>
              </motion.span>
            )}
          </h1>
          <motion.p whileHover={{ scale: 1.02 }} className="text-muted-foreground/80 text-[15px] leading-relaxed origin-left cursor-default">
            {hasName
              ? 'Your personal productivity system is ready.'
              : 'Click on your name above to personalize your workspace.'}
          </motion.p>
        </div>
        {hasName && (
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/80 to-primary/30 shadow-lg flex items-center justify-center text-primary-foreground font-bold text-xl border-2 border-background shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Stats row — all from real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Focus Time', value: `${focusMinutes} min`, icon: Clock, accent: 'text-blue-400' },
          { label: 'Active Plans', value: `${activePlans}`, icon: Flame, accent: 'text-orange-400' },
          { label: 'Daily Tasks', value: totalToday > 0 ? `${completedToday}/${totalToday}` : '—', icon: CheckCircle2, accent: 'text-emerald-400' },
          { label: 'Documents', value: `${documents.length}`, icon: BookOpen, accent: 'text-violet-400' },
        ].map((stat, i) => (
          <GlassCard key={i} delay={i * 0.06} className="p-5 group">
            <div className="flex items-center gap-4 h-full">
              <div className={`w-11 h-11 rounded-[14px] bg-muted/20 flex items-center justify-center ${stat.accent} shrink-0 border border-border/10`}>
                <stat.icon size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center min-w-0 py-0.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <motion.p whileHover={{ scale: 1.1 }} className="text-[20px] font-bold tracking-tight leading-none mb-1.5 tabular-nums text-foreground truncate origin-left cursor-default">{stat.value}</motion.p>
                  {stat.label === 'Focus Time' && (
                    <button 
                      onClick={() => setShowResetModal(true)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                      title="Reset Focus Time"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
                <motion.p whileHover={{ scale: 1.05, color: 'var(--foreground)' }} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 truncate origin-left cursor-default transition-colors">{stat.label}</motion.p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">

        {/* Up Next — 3 columns */}
        <GlassCard delay={0.25} className="lg:col-span-3 min-h-[300px] lg:h-full overflow-hidden">
          <div className="p-5 h-full flex flex-col w-full">
            <motion.h2 whileHover={{ scale: 1.05 }} className="text-base font-semibold mb-4 tracking-tight flex items-center gap-2.5 shrink-0 origin-left cursor-default">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Up Next
            </motion.h2>
            <div className="flex-1 overflow-hidden relative min-h-0">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2">
                {upcomingTasks.length > 0 ? (
                  <div className="flex flex-col gap-2 pb-2">
                    {upcomingTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/15 border border-border/30 hover:bg-muted/25 transition-colors shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <motion.span whileHover={{ scale: 1.02, x: 5 }} className="text-[14px] font-medium text-foreground/80 truncate flex-1 origin-left cursor-default transition-transform">{t.title}</motion.span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 shrink-0 bg-muted/30 px-2 py-0.5 rounded-full">{t.scope}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} strokeWidth={1.2} className="text-muted-foreground/20" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/40 max-w-[200px] leading-relaxed">No tasks yet. Head to Plans to add some.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right column — Chain + Study summaries — 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-5 h-full">
          {/* Chains overview */}
          <GlassCard delay={0.3} className="flex-1 min-h-[290px] overflow-hidden">
            <div className="p-5 h-full flex flex-col w-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <motion.h2 whileHover={{ scale: 1.05 }} className="text-base font-semibold tracking-tight flex items-center gap-2.5 origin-left cursor-default">
                  <LinkIcon size={14} className="text-orange-400" />
                  Chains
                </motion.h2>
                <button 
                  onClick={() => setIsAddingChain(!isAddingChain)}
                  className={`p-1.5 rounded-lg transition-all ${isAddingChain ? 'bg-primary/20 text-primary rotate-45' : 'hover:bg-muted/30 text-muted-foreground/40 hover:text-foreground'}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden relative min-h-0 h-[220px]">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-4">
                  {isAddingChain ? (
                    <motion.form 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleCreateChain}
                      className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">New Chain Name</p>
                      <input 
                        autoFocus
                        type="text"
                        placeholder="e.g., Read 30m"
                        value={newChainTitle}
                        onChange={(e) => setNewChainTitle(e.target.value)}
                        onBlur={() => !newChainTitle.trim() && setIsAddingChain(false)}
                        className="w-full bg-background/50 border border-primary/10 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                      <div className="flex gap-2">
                        <button 
                          type="submit"
                          className="flex-1 py-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Create
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsAddingChain(false)}
                          className="flex-1 py-1.5 bg-muted text-muted-foreground text-[11px] font-bold rounded-lg hover:bg-muted/80 active:scale-[0.98] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  ) : chainSummaries.length > 0 ? (
                    <>
                      {chainSummaries.map((cs, i) => (
                        <Link key={cs.id} href={`/chain?id=${cs.id}`}>
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/15 border border-border/20 shrink-0 h-[68px] group transition-all cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <motion.p whileHover={{ x: 3 }} className="text-[13px] font-bold truncate origin-left cursor-default transition-transform tracking-tight">{cs.title}</motion.p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1 h-1 rounded-full bg-orange-400/40" />
                                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.12em]">
                                  {cs.completed} days done
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0 ml-4">
                              <div className="text-right">
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-1 relative">
                                    {cs.current > 0 && (
                                      <motion.div 
                                        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -left-3 w-1 h-3 bg-orange-500 blur-sm rounded-full"
                                      />
                                    )}
                                    <p className={`text-xl font-black tabular-nums leading-none ${cs.current > 0 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]' : 'text-muted-foreground/30'}`}>
                                      {cs.current}
                                    </p>
                                  </div>
                                  <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">streak</p>
                                </div>
                              </div>

                              <div className="w-[1px] h-6 bg-border/20 shrink-0" />

                              <div className="text-right">
                                <div className="flex flex-col items-center">
                                  <p className="text-xs font-black tabular-nums text-yellow-400/80 leading-none">{cs.best}</p>
                                  <p className="text-[7px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">best</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-muted/5 rounded-2xl border border-dashed border-border/30">
                      <div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center mb-3">
                        <LinkIcon size={20} strokeWidth={1.5} className="text-muted-foreground/20" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/30">No active chains</p>
                    </div>
                  )}
                </div>
                {/* Visual fading for bottom clipping if list is long */}
                {chainSummaries.length > 3 && !isAddingChain && (
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent pointer-events-none z-10" />
                )}
              </div>
            </div>
          </GlassCard>

          {/* Study + Reading quick stats */}
          <GlassCard delay={0.35} className="p-5 flex flex-col flex-1 min-h-[140px] justify-center">
            <motion.h2 whileHover={{ scale: 1.05 }} className="text-base font-semibold mb-4 tracking-tight flex items-center gap-2.5 origin-left cursor-default">
              <Layers size={14} className="text-violet-400" />
              Study
            </motion.h2>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 text-center flex flex-col items-center justify-center group cursor-default">
                <motion.p whileHover={{ scale: 1.15 }} className="text-2xl font-bold tabular-nums leading-none mb-1.5 transition-all">{studyBlocks.length}</motion.p>
                <motion.p whileHover={{ scale: 1.05 }} className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 transition-all">Blocks</motion.p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 text-center flex flex-col items-center justify-center group cursor-default">
                <motion.p whileHover={{ scale: 1.15 }} className="text-2xl font-bold tabular-nums leading-none mb-1.5 transition-all">
                  {totalStudyTasks > 0 ? `${completedStudyTasks}/${totalStudyTasks}` : '—'}
                </motion.p>
                <motion.p whileHover={{ scale: 1.05 }} className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 transition-all">Tasks</motion.p>
              </div>
            </div>
            {documents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-xs text-muted-foreground/50 font-medium">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} in library
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>

    {/* Reset Confirmation Modal */}
    <AnimatePresence>
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetModal(false)}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[400px] bg-card border border-border/50 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Reset Focus Time?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                This will reset your total focus minutes to zero and clear your historical session logs. This action cannot be undone.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    resetFocusTime();
                    setShowResetModal(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
                >
                  Reset Everything
                </button>
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-semibold transition-all active:scale-[0.98]"
                >
                  Keep My Progress
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
  );
}
