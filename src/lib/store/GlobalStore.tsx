"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { GlobalState, ProfileState, TimerPreferences, TimerState, FocusSession, Task, StudyBlock, ReadingDocument, Chain, WisdomQuote, Roadmap, RoadmapNode, RoadmapEdge, CalendarEvent } from './types';

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
  wisdomQuotes: WisdomQuote[];
  roadmaps: Roadmap[];
  calendarEvents?: CalendarEvent[];
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
  wisdomQuotes: [],
  roadmaps: [],
  calendarEvents: [
    {
      id: 'demo-cal-1',
      title: 'Yazılım Mimarisi ve Next.js İncelemesi',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      category: 'study',
      color: '#3B82F6',
      description: 'Proje modüllerini ve state akışını gözden geçir.',
      createdAt: Date.now(),
    },
    {
      id: 'demo-cal-2',
      title: 'Haftalık Proje Değerlendirmesi',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      category: 'task',
      color: '#10B981',
      description: 'Tamamlanan adımları ve hedefleri kontrol et.',
      createdAt: Date.now(),
    }
  ]
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
  const [wisdomQuotes, setWisdomQuotes] = useState<WisdomQuote[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(emptyDefaults.calendarEvents || []);

  // Hydrate from local file database (with localStorage as fallback)
  useEffect(() => {
    const hydrate = async () => {
      let saved: Partial<StoredData> | null = null;
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            saved = json.data;
          }
        }
      } catch (err) {
        console.error('Failed to load from local file DB, trying localStorage...', err);
      }

      if (!saved) {
        try {
          const res = await fetch('/db.json');
          if (res.ok) {
            saved = await res.json();
          }
        } catch { /* fallback to local storage */ }
      }

      if (!saved) {
        saved = loadFromStorage();
      }


      if (saved) {
        if (saved.profile) setProfile({ ...emptyDefaults.profile, ...saved.profile });
        if (saved.timerPrefs) setTimerPrefs({ ...emptyDefaults.timerPrefs, ...saved.timerPrefs });
        if (saved.timerState) setTimerState({ ...emptyDefaults.timerState, ...saved.timerState });
        if (saved.focusSessions) setFocusSessions(saved.focusSessions);
        if (saved.tasks) setTasks(saved.tasks);
        if (saved.studyBlocks) setStudyBlocks(saved.studyBlocks);
        if (saved.documents) setDocuments(saved.documents);
        if (saved.chains) setChains(saved.chains);
        if (saved.wisdomQuotes) setWisdomQuotes(saved.wisdomQuotes);
        if (saved.roadmaps) setRoadmaps(saved.roadmaps);
        if (saved.calendarEvents) setCalendarEvents(saved.calendarEvents);
      }
      setHydrated(true);
    };

    hydrate();
  }, []);

  // Persist on change with debounce to avoid blocking main thread on every update
  useEffect(() => {
    if (!hydrated) return;
    const timeoutId = setTimeout(async () => {
      const dataToSave = { profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains, wisdomQuotes, roadmaps, calendarEvents };

      // 1. Save to LocalStorage as a fallback
      saveToStorage(dataToSave);

      // 2. Save to local file DB on disk
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });
      } catch (err) {
        console.error('Failed to save to local file DB:', err);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);
  }, [hydrated, profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains, wisdomQuotes, roadmaps, calendarEvents]);

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

  // ── Wisdom ──
  const addWisdomQuote = useCallback((quote: string, author: string, source: string, color: string) => {
    setWisdomQuotes(prev => [{ id: uid(), quote, author, source, color, createdAt: Date.now() }, ...prev]);
  }, []);
  const deleteWisdomQuote = useCallback((id: string) => setWisdomQuotes(prev => prev.filter(q => q.id !== id)), []);

  // ── Roadmaps ──
  const addRoadmap = useCallback((title: string) => {
    setRoadmaps(prev => [...prev, { id: uid(), title, createdAt: Date.now(), nodes: [], edges: [] }]);
  }, []);
  const deleteRoadmap = useCallback((id: string) => setRoadmaps(prev => prev.filter(r => r.id !== id)), []);
  const updateRoadmapNodes = useCallback((id: string, nodes: RoadmapNode[]) => {
    setRoadmaps(prev => prev.map(r => r.id === id ? { ...r, nodes } : r));
  }, []);
  const updateRoadmapEdges = useCallback((id: string, edges: RoadmapEdge[]) => {
    setRoadmaps(prev => prev.map(r => r.id === id ? { ...r, edges } : r));
  }, []);

  // ── Calendar Events ──
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    setCalendarEvents(prev => [...prev, { ...event, id: uid(), createdAt: Date.now() }]);
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
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

  const storeValue = useMemo(() => ({
    profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains, wisdomQuotes, roadmaps, calendarEvents,
    updateProfile, updateTimerPrefs, updateTimerState,
    addTask, toggleTask, deleteTask,
    addStudyBlock, renameStudyBlock, deleteStudyBlock, addStudyTask, toggleStudyTask, deleteStudyTask,
    addDocument, updateDocumentProgress, updateDocumentAnnotations, deleteDocument,
    addChain, deleteChain, setChainDay, clearChainDay,
    addWisdomQuote, deleteWisdomQuote,
    addRoadmap, deleteRoadmap, updateRoadmapNodes, updateRoadmapEdges,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    logFocusSession, resetFocusTime,
  }), [
    profile, timerPrefs, timerState, focusSessions, tasks, studyBlocks, documents, chains, wisdomQuotes, roadmaps, calendarEvents,
    updateProfile, updateTimerPrefs, updateTimerState,
    addTask, toggleTask, deleteTask,
    addStudyBlock, renameStudyBlock, deleteStudyBlock, addStudyTask, toggleStudyTask, deleteStudyTask,
    addDocument, updateDocumentProgress, updateDocumentAnnotations, deleteDocument,
    addChain, deleteChain, setChainDay, clearChainDay,
    addWisdomQuote, deleteWisdomQuote,
    addRoadmap, deleteRoadmap, updateRoadmapNodes, updateRoadmapEdges,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    logFocusSession, resetFocusTime,
  ]);

  if (!hydrated) return null;

  return (
    <GlobalContext.Provider value={storeValue}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalStore() {
  const context = useContext(GlobalContext);
  if (context === undefined) throw new Error('useGlobalStore must be used within GlobalStoreProvider');
  return context;
}
