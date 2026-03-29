"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GlobalState, ProfileState, TimerPreferences, TimerState, FocusSession, Task, StudyBlock, ReadingDocument, Chain } from './types';

// ── localStorage helpers ──
const STORAGE_KEY = 'osfer_store';

interface StoredData {
  profile: ProfileState;
  timerPrefs: TimerPreferences;
  timerState: TimerState;
  focusSessions: FocusSession[];
  tasks: Task[];
  studyBlocks: StudyBlock[];
  documents: ReadingDocument[];
  chains: Chain[];
}

function loadFromStorage(): Partial<StoredData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveToStorage(data: StoredData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

const uid = () => Math.random().toString(36).substring(2, 9);

const emptyTimerState: TimerState = {
  mode: 'focus',
  isRunning: false,
  endTime: null,
  focusPausedTimeLeft: null,
  breakPausedTimeLeft: null,
  stopwatchElapsed: 0,
  stopwatchStartTime: null,
  laps: [],
};

const emptyDefaults: StoredData = {
  profile: { name: '', appName: 'Osfer', totalFocusMinutes: 0 },
  timerPrefs: { focusMinutes: 25, breakMinutes: 5 },
  timerState: emptyTimerState,
  focusSessions: [],
  tasks: [],
  studyBlocks: [],
  documents: [],
  chains: [],
};

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function GlobalStoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(emptyDefaults.profile);
  const [timerPrefs, setTimerPrefs] = useState<TimerPreferences>(emptyDefaults.timerPrefs);
  const [timerState, setTimerState] = useState<TimerState>(emptyDefaults.timerState);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [documents, setDocuments] = useState<ReadingDocument[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      if (saved.profile) setProfile({ ...emptyDefaults.profile, ...saved.profile });
      if (saved.timerPrefs) setTimerPrefs({ ...emptyDefaults.timerPrefs, ...saved.timerPrefs });
      if (saved.timerState) setTimerState({ ...emptyDefaults.timerState, ...saved.timerState });
      if (saved.focusSessions) setFocusSessions(saved.focusSessions);
      if (saved.tasks) setTasks(saved.tasks);
      if (saved.studyBlocks) setStudyBlocks(saved.studyBlocks);
      if (saved.documents) setDocuments(saved.documents);
      if (saved.chains) setChains(saved.chains);
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage({ profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains });
  }, [hydrated, profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains]);

  // ── Profile ──
  const updateProfile = useCallback((u: Partial<ProfileState>) => setProfile(p => ({ ...p, ...u })), []);
  const updateTimerPrefs = useCallback((u: Partial<TimerPreferences>) => setTimerPrefs(p => ({ ...p, ...u })), []);
  const updateTimerState = useCallback((u: Partial<TimerState>) => setTimerState(p => ({ ...p, ...u })), []);

  // ── Tasks ──
  const addTask = useCallback((task: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...task, id: uid(), status: 'todo', createdAt: Date.now() }]);
  }, []);
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'completed' : 'todo' } : t));
  }, []);
  const deleteTask = useCallback((id: string) => setTasks(prev => prev.filter(t => t.id !== id)), []);

  // ── Study ──
  const addStudyBlock = useCallback((title: string, color: string) => {
    setStudyBlocks(prev => [...prev, { id: uid(), title, color, tasks: [] }]);
  }, []);
  const renameStudyBlock = useCallback((blockId: string, title: string) => {
    setStudyBlocks(prev => prev.map(b => b.id === blockId ? { ...b, title } : b));
  }, []);
  const deleteStudyBlock = useCallback((blockId: string) => {
    setStudyBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);
  const addStudyTask = useCallback((blockId: string, title: string) => {
    setStudyBlocks(prev => prev.map(b => b.id === blockId ? { ...b, tasks: [...b.tasks, { id: uid(), title, status: 'todo' }] } : b));
  }, []);
  const toggleStudyTask = useCallback((blockId: string, taskId: string) => {
    setStudyBlocks(prev => prev.map(b => b.id === blockId ? { ...b, tasks: b.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'todo' ? 'completed' : 'todo' } : t) } : b));
  }, []);
  const deleteStudyTask = useCallback((blockId: string, taskId: string) => {
    setStudyBlocks(prev => prev.map(b => b.id === blockId ? { ...b, tasks: b.tasks.filter(t => t.id !== taskId) } : b));
  }, []);

  // ── Documents ──
  const addDocument = useCallback((doc: ReadingDocument) => setDocuments(prev => [...prev, doc]), []);
  const updateDocumentProgress = useCallback((id: string, page: number, totalPages?: number) => {
    setDocuments(prev => prev.map(d => d.id === id ? { 
      ...d, 
      currentPage: page, 
      totalPages: totalPages ?? d.totalPages,
      lastOpened: Date.now() 
    } : d));
  }, []);
  const updateDocumentAnnotations = useCallback((id: string, page: number, annotations: any[]) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== id) return d;
      const newAnnotations = { ...(d.annotations || {}) };
      newAnnotations[page] = annotations;
      return { ...d, annotations: newAnnotations };
    }));
  }, []);
  const deleteDocument = useCallback((id: string) => setDocuments(prev => prev.filter(d => d.id !== id)), []);

  // ── Chains ──
  const addChain = useCallback((title: string) => {
    setChains(prev => [...prev, { id: uid(), title, createdAt: Date.now(), days: {} }]);
  }, []);
  const deleteChain = useCallback((chainId: string) => setChains(prev => prev.filter(c => c.id !== chainId)), []);
  const setChainDay = useCallback((chainId: string, dateStr: string, note: string, color: string) => {
    setChains(prev => prev.map(c => c.id === chainId ? { ...c, days: { ...c.days, [dateStr]: { note, color } } } : c));
  }, []);
  const clearChainDay = useCallback((chainId: string, dateStr: string) => {
    setChains(prev => prev.map(c => {
      if (c.id !== chainId) return c;
      const days = { ...c.days };
      delete days[dateStr];
      return { ...c, days };
    }));
  }, []);

  // ── Focus ──
  const logFocusSession = useCallback((minutes: number) => {
    setProfile(p => ({ ...p, totalFocusMinutes: p.totalFocusMinutes + minutes }));
    setFocusSessions(prev => [...prev, { id: uid(), minutes, timestamp: Date.now() }]);
  }, []);

  const resetFocusTime = useCallback(() => {
    setProfile(p => ({ ...p, totalFocusMinutes: 0 }));
    setFocusSessions([]);
  }, []);

  if (!hydrated) return null;

  return (
    <GlobalContext.Provider value={{
      profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains,
      updateProfile, updateTimerPrefs, updateTimerState,
      addTask, toggleTask, deleteTask,
      addStudyBlock, renameStudyBlock, deleteStudyBlock, addStudyTask, toggleStudyTask, deleteStudyTask,
      addDocument, updateDocumentProgress, updateDocumentAnnotations, deleteDocument,
      addChain, deleteChain, setChainDay, clearChainDay,
      logFocusSession, resetFocusTime,
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalStore() {
  const context = useContext(GlobalContext);
  if (context === undefined) throw new Error('useGlobalStore must be used within GlobalStoreProvider');
  return context;
}
