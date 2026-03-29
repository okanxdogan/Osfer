export type TaskStatus = 'todo' | 'completed';
export type PlanScope = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  scope: PlanScope;
  createdAt: number;
}

export interface StudyTask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface StudyBlock {
  id: string;
  title: string;
  color: string;
  tasks: StudyTask[];
}

export interface ReadingDocument {
  id: string;
  title: string;
  totalPages: number;
  currentPage: number;
  furthestPage?: number;
  lastOpened: number;
  coverColor: string;
  fileDataUrl?: string; // base64 data URL for actual PDF content
  annotations?: { [page: number]: any[] }; // Persisted drawn strokes
}

export interface ChainDayEntry {
  note: string;
  color: string;
}

export interface Chain {
  id: string;
  title: string;
  createdAt: number;
  days: Record<string, ChainDayEntry>; // 'YYYY-MM-DD' -> { note, color }
}

export interface ProfileState {
  name: string;
  appName: string;
  totalFocusMinutes: number;
}

export interface TimerPreferences {
  focusMinutes: number;
  breakMinutes: number;
}

// Timer runtime state persisted in global store so it survives navigation
export interface TimerState {
  mode: 'focus' | 'break' | 'stopwatch';
  isRunning: boolean;
  /** epoch ms when the timer will reach 0 (only meaningful while running) */
  endTime: number | null;
  /** paused progress state per mode */
  focusPausedTimeLeft: number | null;
  breakPausedTimeLeft: number | null;
  stopwatchElapsed: number; // accumulated seconds
  /** tracking when stopwatch started */
  stopwatchStartTime: number | null;
  laps: { time: string; mode: string; totalSeconds: number; lapNumber?: number }[];
}

export interface FocusSession {
  id: string;
  minutes: number;
  timestamp: number;
}

export interface GlobalState {
  profile: ProfileState;
  timerPrefs: TimerPreferences;
  timerState: TimerState;
  focusSessions: FocusSession[];
  tasks: Task[];
  studyBlocks: StudyBlock[];
  documents: ReadingDocument[];
  chains: Chain[];

  updateProfile: (updates: Partial<ProfileState>) => void;
  updateTimerPrefs: (updates: Partial<TimerPreferences>) => void;
  updateTimerState: (updates: Partial<TimerState>) => void;

  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addStudyBlock: (title: string, color: string) => void;
  renameStudyBlock: (blockId: string, title: string) => void;
  deleteStudyBlock: (blockId: string) => void;
  addStudyTask: (blockId: string, title: string) => void;
  toggleStudyTask: (blockId: string, taskId: string) => void;
  deleteStudyTask: (blockId: string, taskId: string) => void;

  addDocument: (doc: ReadingDocument) => void;
  updateDocumentProgress: (id: string, page: number, totalPages?: number) => void;
  updateDocumentAnnotations: (id: string, page: number, annotations: any[]) => void;
  deleteDocument: (id: string) => void;

  addChain: (title: string) => void;
  deleteChain: (chainId: string) => void;
  setChainDay: (chainId: string, dateStr: string, note: string, color: string) => void;
  clearChainDay: (chainId: string, dateStr: string) => void;

  logFocusSession: (minutes: number) => void;
  resetFocusTime: () => void;
}
