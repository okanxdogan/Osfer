"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { CircularTimer } from "@/components/modules/time/CircularTimer";
import { useGlobalStore } from "@/lib/store/GlobalStore";
import { Play, Pause, RotateCcw, Flag, Trash2, X, Timer, Activity } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function TimePage() {
  const { timerPrefs, updateTimerPrefs, timerState, updateTimerState, logFocusSession } = useGlobalStore();
  const [editingDuration, setEditingDuration] = useState(false);
  const [displayTime, setDisplayTime] = useState<number | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const lapsRef = useRef(timerState.laps);
  useEffect(() => { lapsRef.current = timerState.laps; }, [timerState.laps]);

  const mode = timerState.mode;
  const isCountdown = mode === 'focus' || mode === 'break';
  const focusDuration = timerPrefs.focusMinutes * 60;
  const breakDuration = timerPrefs.breakMinutes * 60;

  const computeCurrent = useCallback(() => {
    if (mode === 'stopwatch') {
      if (timerState.isRunning && timerState.stopwatchStartTime) {
        return (timerState.stopwatchElapsed || 0) + Math.floor((Date.now() - timerState.stopwatchStartTime) / 1000);
      }
      return timerState.stopwatchElapsed || 0;
    }
    
    if (timerState.isRunning && timerState.endTime) {
      return Math.max(0, Math.ceil((timerState.endTime - Date.now()) / 1000));
    }
    
    if (mode === 'focus') return timerState.focusPausedTimeLeft ?? focusDuration;
    if (mode === 'break') return timerState.breakPausedTimeLeft ?? breakDuration;
    return 0;
  }, [timerState.isRunning, timerState.endTime, timerState.stopwatchStartTime, timerState.stopwatchElapsed, timerState.focusPausedTimeLeft, timerState.breakPausedTimeLeft, mode, focusDuration, breakDuration]);

  // Tick loop
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);

    if (timerState.isRunning) {
      const tick = () => {
        const current = computeCurrent();
        setDisplayTime(current);
        
        // Countdown completion logic
        if (isCountdown && current <= 0) {
          const nextMode = mode === 'focus' ? 'break' : 'focus';
          const duration = mode === 'focus' ? focusDuration : breakDuration;
          updateTimerState({ 
            isRunning: false, 
            endTime: null, 
            mode: nextMode,
            focusPausedTimeLeft: null,
            breakPausedTimeLeft: null,
            laps: [{ time: formatTime(duration), mode, totalSeconds: duration }, ...lapsRef.current]
          });

          if (mode === 'focus') {
            logFocusSession(timerPrefs.focusMinutes);
          }
        }
      };
      tick();
      tickRef.current = setInterval(tick, 200);
    } else {
      setDisplayTime(computeCurrent());
    }

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [timerState.isRunning, mode, computeCurrent, isCountdown, focusDuration, logFocusSession, timerPrefs.focusMinutes, updateTimerState]);

  const currentValue = displayTime ?? computeCurrent();

  // ── Controls ──
  const handleStartPause = () => {
    if (timerState.isRunning) {
      // PAUSE logically — save current progress to paused states
      if (mode === 'stopwatch') {
        const elapsedNow = (timerState.stopwatchElapsed || 0) + Math.floor((Date.now() - (timerState.stopwatchStartTime || Date.now())) / 1000);
        updateTimerState({ isRunning: false, stopwatchStartTime: null, stopwatchElapsed: elapsedNow });
      } else {
        const remainingNow = Math.max(0, Math.ceil(((timerState.endTime || Date.now()) - Date.now()) / 1000));
        updateTimerState({
          isRunning: false,
          endTime: null,
          ...(mode === 'focus' ? { focusPausedTimeLeft: remainingNow } : { breakPausedTimeLeft: remainingNow })
        });
      }
    } else {
      // START logically — use paused states if they exist
      if (mode === 'stopwatch') {
        updateTimerState({ isRunning: true, stopwatchStartTime: Date.now() });
      } else {
        // Find what the display is currently showing as 'remaining'
        const baseDuration = mode === 'focus' ? (timerPrefs.focusMinutes * 60) : (timerPrefs.breakMinutes * 60);
        const pausedRemaining = mode === 'focus' ? timerState.focusPausedTimeLeft : timerState.breakPausedTimeLeft;
        
        // If we have a paused value, use it. If not, and we are at 0, don't start. If not and we're just starting fresh, use full duration.
        const startRemaining = pausedRemaining !== null ? pausedRemaining : baseDuration;
        
        if (startRemaining <= 0) return;
        updateTimerState({ isRunning: true, endTime: Date.now() + startRemaining * 1000 });
      }
    }
  };

  const handleReset = () => {
    if (mode === 'stopwatch') {
      updateTimerState({ isRunning: false, stopwatchStartTime: null, stopwatchElapsed: 0 });
    } else if (mode === 'focus') {
      updateTimerState({ isRunning: false, endTime: null, focusPausedTimeLeft: null });
    } else if (mode === 'break') {
      updateTimerState({ isRunning: false, endTime: null, breakPausedTimeLeft: null });
    }
  };

  const switchMode = (newMode: 'focus' | 'break' | 'stopwatch') => {
    if (mode === newMode) return;
    // PAUSE active timer securely before switching
    if (timerState.isRunning) {
      if (mode === 'stopwatch') {
        const elapsedNow = (timerState.stopwatchElapsed || 0) + Math.floor((Date.now() - (timerState.stopwatchStartTime || Date.now())) / 1000);
        updateTimerState({ isRunning: false, stopwatchStartTime: null, stopwatchElapsed: elapsedNow, mode: newMode, endTime: null });
      } else {
        const remainingNow = Math.max(0, Math.ceil(((timerState.endTime || Date.now()) - Date.now()) / 1000));
        updateTimerState({
          isRunning: false,
          endTime: null,
          ...(mode === 'focus' ? { focusPausedTimeLeft: remainingNow } : { breakPausedTimeLeft: remainingNow }),
          mode: newMode
        });
      }
    } else {
      updateTimerState({ mode: newMode });
    }
  };

  const handleLap = () => {
    if (!timerState.isRunning) return;
    
    // Total elapsed in current session — use the live lapsRef to avoid stale closure
    const currentLaps = lapsRef.current;
    const totalCurrent = mode === 'stopwatch' 
      ? currentValue 
      : (mode === 'focus' ? focusDuration - currentValue : breakDuration - currentValue);
    
    // Find the last lap of THIS mode to calculate the segment difference
    const lastSessionLap = currentLaps.find(l => l.mode === mode);
    const lastTotalSeconds = lastSessionLap?.totalSeconds || 0;
    
    // Duration of THIS segment (accurate to the second)
    const segmentSeconds = Math.max(0, Math.floor(totalCurrent - lastTotalSeconds));
    const lapNumber = currentLaps.filter(l => l.mode === mode).length + 1;

    const newLap = { 
      time: formatTime(segmentSeconds), 
      mode, 
      totalSeconds: totalCurrent,
      lapNumber,
    };

    // Use ref-based array to avoid stale closure overwriting previous laps
    updateTimerState({
      laps: [newLap, ...currentLaps],
    });
  };

  const deleteLap = (index: number) => updateTimerState({ laps: timerState.laps.filter((_, i) => i !== index) });
  const clearLaps = () => updateTimerState({ laps: [] });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  let progress = 0;
  if (mode === 'stopwatch') {
    progress = ((currentValue % 60) / 60) * 100; // Loops every 60 seconds
  } else {
    const total = mode === 'focus' ? focusDuration : breakDuration;
    progress = total > 0 ? ((total - currentValue) / total) * 100 : 0;
  }

  return (
    <div className="flex flex-col gap-2 items-center pb-8">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="w-full shrink-0">
          <PageHeader title="Timer" description="Deep work and focused execution." />
        </div>

        <div className="flex flex-col items-center justify-center relative w-full pt-2">
          
          {/* Top Level Mode — Stacked for space */}
          <div className="flex bg-white/5 p-1 rounded-full border border-white/5 mb-4 shrink-0 transition-all">
            <motion.button 
              whileHover="hover"
              onClick={() => switchMode(mode === 'stopwatch' ? 'focus' : mode)} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all ${isCountdown ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/30 hover:text-white'}`}
            >
              <Timer size={14} /> 
              <motion.span 
                variants={{
                  hover: { scale: 1.1 }
                }}
              >
                Countdown
              </motion.span>
            </motion.button>
            <motion.button 
              whileHover="hover"
              onClick={() => switchMode('stopwatch')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all ${mode === 'stopwatch' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-white/30 hover:text-white'}`}
            >
              <Activity size={14} /> 
              <motion.span 
                variants={{
                  hover: { scale: 1.1 }
                }}
              >
                Stopwatch
              </motion.span>
            </motion.button>
          </div>

          {/* Configuration / Sub-mode */}
          <div className="min-h-[30px] flex flex-col items-center justify-center shrink-0 mb-4">
            <AnimatePresence mode="wait">
              {isCountdown ? (
                <motion.div key="countdown-opts" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex flex-col items-center gap-2">
                  <div className="flex gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      onClick={() => switchMode('focus')} 
                      className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all px-2 ${mode === 'focus' ? 'text-primary' : 'text-white/10 hover:text-white/30'}`}
                    >
                      Focus
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      onClick={() => switchMode('break')} 
                      className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all px-2 ${mode === 'break' ? 'text-primary' : 'text-white/10 hover:text-white/30'}`}
                    >
                      Break
                    </motion.button>
                  </div>
                  
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingDuration(!editingDuration)} className="text-[10px] font-bold text-white/20 hover:text-white/40 tracking-wide transition-colors">
                    {timerPrefs.focusMinutes}m / {timerPrefs.breakMinutes}m • {editingDuration ? 'Done' : 'Adjust'}
                  </motion.button>

                  <AnimatePresence>
                    {editingDuration && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 mt-2 bg-white/5 p-2 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2">
                          <span className="text-white/30 font-bold text-[9px] uppercase">Focus</span>
                          <input type="number" min={1} max={120} value={timerPrefs.focusMinutes}
                            onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); updateTimerPrefs({ focusMinutes: v }); if (mode === 'focus' && !timerState.isRunning) updateTimerState({ focusPausedTimeLeft: null }); }}
                            className="w-12 bg-black/40 border-none rounded-lg px-2 py-1 text-center text-xs font-black outline-none focus:ring-1 focus:ring-primary/40 text-white"
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="text-white/30 font-bold text-[9px] uppercase">Break</span>
                          <input type="number" min={1} max={60} value={timerPrefs.breakMinutes}
                            onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); updateTimerPrefs({ breakMinutes: v }); if (mode === 'break' && !timerState.isRunning) updateTimerState({ breakPausedTimeLeft: null }); }}
                            className="w-12 bg-black/40 border-none rounded-lg px-2 py-1 text-center text-xs font-black outline-none focus:ring-1 focus:ring-primary/40 text-white"
                          />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="stopwatch-opts" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/50">Tracking Active Session</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pure minimal timer */}
          <div className="shrink-0 scale-90 sm:scale-100 flex items-center justify-center my-0">
             <CircularTimer progress={progress} timeString={formatTime(currentValue)} isRunning={timerState.isRunning} />
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-8 shrink-0 w-full max-w-[280px]">
            <button onClick={handleReset} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group shrink-0">
              <RotateCcw size={20} className="group-hover:-rotate-90 transition-transform duration-500" strokeWidth={2.5} />
            </button>

            <button
              onClick={handleStartPause}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 shrink-0 ${timerState.isRunning ? 'bg-black border-2 border-primary/40 text-primary' : 'bg-primary text-primary-foreground shadow-primary/20'}`}
            >
              {timerState.isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              disabled={!timerState.isRunning} 
              onClick={handleLap} 
              className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/5 transition-all shrink-0 ${timerState.isRunning ? 'text-white hover:bg-white/10' : 'text-white/10 cursor-not-allowed opacity-30'}`}
            >
              <Flag size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Session Records — always visible, empty state when no laps */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border-t border-border/20 pt-8 w-full">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Session Records</h3>
            {timerState.laps.length > 0 && (
              <button onClick={clearLaps} className="text-xs font-semibold text-muted-foreground/40 hover:text-destructive transition-colors flex items-center gap-1 bg-muted/20 px-3 py-1.5 rounded-md">
                <X size={12} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {timerState.laps.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1">
                  <Flag size={16} className="text-white/20" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground/40 tracking-wide">No laps recorded yet</p>
                <p className="text-[10px] text-muted-foreground/25">Press the flag button while the timer is running</p>
              </motion.div>
            ) : (
              <motion.div
                key="laps"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                {timerState.laps.map((lap, i) => (
                  <motion.div
                    key={`${lap.mode}-${lap.totalSeconds}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-5 py-3.5 rounded-xl bg-muted/10 border border-border/20 flex justify-between items-center text-sm hover:bg-muted/20 transition-colors group"
                  >
                    <motion.span whileHover={{ scale: 1.05, x: 5 }} className="text-foreground/80 flex items-center gap-3 font-semibold origin-left transition-transform cursor-default">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"><Flag size={10} className="text-primary" /></div>
                      Lap {timerState.laps.length - i}
                    </motion.span>
                    <div className="flex items-center gap-4">
                      <motion.span whileHover={{ scale: 1.1 }} className="uppercase text-[9px] tracking-widest font-bold text-muted-foreground/60 cursor-default">{lap.mode}</motion.span>
                      <motion.span whileHover={{ scale: 1.1 }} className="tabular-nums font-bold text-foreground text-[15px] cursor-default">{lap.time}</motion.span>
                      <button onClick={() => deleteLap(i)} className="p-1.5 text-muted-foreground/30 hover:text-destructive transition-colors rounded-md opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
