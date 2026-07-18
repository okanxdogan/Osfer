"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useTheme } from "next-themes";
import { Paintbrush, Clock, UserCog, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalStore } from "@/lib/store/GlobalStore";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile, timerPrefs, updateTimerPrefs } = useGlobalStore();
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'timer', label: 'Focus & Time', icon: Clock },
    { id: 'account', label: 'Account & Data', icon: UserCog },
  ];

  return (
    <div className="flex flex-col gap-6 h-full relative pb-10">
      <PageHeader title="Settings" description={`Customize your ${profile.appName || 'Osfer'} experience.`} />

      <div className="flex-1 flex flex-col md:flex-row gap-6 items-start max-w-5xl w-full">
        <aside className="w-full md:w-56 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-semibold w-full text-left whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground'}`}
            >
              <tab.icon size={18} strokeWidth={1.8} />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'appearance' && (
              <motion.div key="app" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <GlassCard className="p-6 md:p-8">
                  <h3 className="text-lg font-bold mb-6">Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'dark', label: 'Dark Mode', desc: 'Deep focus-oriented dark interface.' },
                      { id: 'light', label: 'Light Mode', desc: 'Bright and clean daylight aesthetic.' }
                    ].map(t => (
                      <div key={t.id} onClick={() => setTheme(t.id)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-0.5 ${theme === t.id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border/40 hover:border-primary/30 bg-card/30'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold">{t.label}</p>
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors ${theme === t.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`} />
                        </div>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'timer' && (
              <motion.div key="timer" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard className="p-6 md:p-8">
                  <h3 className="text-lg font-bold mb-6">Timer Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/10 p-5 rounded-xl border border-border/30">
                      <div>
                        <p className="font-semibold mb-0.5">Focus Duration</p>
                        <p className="text-xs text-muted-foreground/60">Length of each focus session</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} max={120} value={timerPrefs.focusMinutes}
                          onChange={e => updateTimerPrefs({ focusMinutes: Math.max(1, parseInt(e.target.value) || 25) })}
                          className="w-16 bg-muted/20 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-semibold outline-none focus:border-primary/50" />
                        <span className="text-sm text-muted-foreground/50 font-medium">min</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-muted/10 p-5 rounded-xl border border-border/30">
                      <div>
                        <p className="font-semibold mb-0.5">Break Duration</p>
                        <p className="text-xs text-muted-foreground/60">Rest period between sessions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} max={60} value={timerPrefs.breakMinutes}
                          onChange={e => updateTimerPrefs({ breakMinutes: Math.max(1, parseInt(e.target.value) || 5) })}
                          className="w-16 bg-muted/20 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-semibold outline-none focus:border-primary/50" />
                        <span className="text-sm text-muted-foreground/50 font-medium">min</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard className="min-h-[360px] w-full">
                  <div className="p-10 flex flex-col items-center justify-center text-center w-full h-full min-h-[360px]">
                    <div className="w-20 h-20 rounded-3xl bg-muted/10 flex items-center justify-center mb-6 border border-border/20 shadow-inner">
                      <Lock size={36} strokeWidth={1.5} className="text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">Local Storage</h3>
                    <p className="text-sm text-muted-foreground/50 max-w-[280px] leading-relaxed mx-auto">
                      All data is stored locally in your browser. Nothing leaves your device. Cloud sync coming in a future update.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
