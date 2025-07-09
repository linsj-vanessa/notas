import { Note, CreateNoteData, UpdateNoteData } from './note';
import { ThemeConfig, NotificationConfig } from './ui.types';

// Estados dos stores
export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  
  // Actions
  loadNotes: () => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

export interface TrashState {
  // Actions
  deleteNote: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  getTrashNotes: () => Promise<Note[]>;
  emptyTrash: () => Promise<void>;
  cleanupOldTrash: () => Promise<void>;
}

export interface UIState {
  searchTerm: string;
  isFocusMode: boolean;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFocusMode: (enabled: boolean) => void;
  getFilteredNotes: () => Note[];
  clearSearch: () => void;
}

export interface ThemeState {
  currentTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  applyTheme: (theme: ThemeConfig) => void;
}

export interface NotificationState {
  notifications: NotificationConfig[];
  addNotification: (notification: Omit<NotificationConfig, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Utility types para stores
export type StoreActions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

export type StoreState<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : T[K];
};

// Tipos para persistência
export interface PersistConfig {
  name: string;
  partialize?: (state: any) => any;
  version?: number;
  migrate?: (persistedState: any, version: number) => any;
} 