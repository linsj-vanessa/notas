import { create } from 'zustand';
import { useNotesStore } from './notesStore';
import { useFileNotesStore } from './fileNotesStore';
import { useSetupStore, type StorageType } from './setupStore';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';

interface AppStoreManager {
  currentStorageType: StorageType | null;
  isReady: boolean;
  
  // Actions unificadas que redirecionam para o store apropriado
  loadNotes: () => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  
  // Getters unificados
  getNotes: () => Note[];
  getCurrentNote: () => Note | null;
  getIsLoading: () => boolean;
  
  // Gerenciamento
  setStorageType: (type: StorageType) => Promise<void>;
  initialize: () => void;
}

export const useAppStoreManager = create<AppStoreManager>((set, get) => ({
  currentStorageType: null,
  isReady: false,
  
  loadNotes: async () => {
    const { currentStorageType } = get();
    
    try {
      if (currentStorageType === 'indexeddb') {
        const { loadNotes } = useNotesStore.getState();
        await loadNotes();
      } else if (currentStorageType === 'filesystem') {
        const { directories, loadNotesFromFiles, initializeFileSystem } = useFileNotesStore.getState();
        
        // Verificar se os diretórios estão inicializados
        if (!directories.notes || !directories.trash) {
          console.log('🔧 Diretórios não inicializados, tentando inicializar...');
          await initializeFileSystem();
        }
        
        await loadNotesFromFiles();
      } else {
        console.warn('Storage type não configurado ainda');
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      throw error;
    }
  },
  
  createNote: async (data: CreateNoteData) => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { createNote } = useNotesStore.getState();
      return await createNote(data);
    } else if (currentStorageType === 'filesystem') {
      const { createNote } = useFileNotesStore.getState();
      return await createNote(data);
    }
    
    throw new Error('Storage type not configured');
  },
  
  updateNote: async (id: string, data: UpdateNoteData) => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { updateNote } = useNotesStore.getState();
      await updateNote(id, data);
    } else if (currentStorageType === 'filesystem') {
      const { updateNote } = useFileNotesStore.getState();
      await updateNote(id, data);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  deleteNote: async (id: string) => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      // Para IndexedDB, usamos o trash store
      const { useTrashStore } = await import('./trashStore');
      const trashStore = useTrashStore.getState();
      await trashStore.moveToTrash(id);
    } else if (currentStorageType === 'filesystem') {
      const { moveToTrash } = useFileNotesStore.getState();
      await moveToTrash(id);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  setCurrentNote: (note: Note | null) => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { setCurrentNote } = useNotesStore.getState();
      setCurrentNote(note);
    } else if (currentStorageType === 'filesystem') {
      const { setCurrentNote } = useFileNotesStore.getState();
      setCurrentNote(note);
    }
  },
  
  getNotes: () => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { notes } = useNotesStore.getState();
      return notes;
    } else if (currentStorageType === 'filesystem') {
      const { notes } = useFileNotesStore.getState();
      return notes;
    }
    
    return [];
  },
  
  getCurrentNote: () => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { currentNote } = useNotesStore.getState();
      return currentNote;
    } else if (currentStorageType === 'filesystem') {
      const { currentNote } = useFileNotesStore.getState();
      return currentNote;
    }
    
    return null;
  },
  
  getIsLoading: () => {
    const { currentStorageType } = get();
    
    if (currentStorageType === 'indexeddb') {
      const { isLoading } = useNotesStore.getState();
      return isLoading;
    } else if (currentStorageType === 'filesystem') {
      const { isLoading } = useFileNotesStore.getState();
      return isLoading;
    }
    
    return false;
  },
  
  setStorageType: async (type: StorageType) => {
    set({ currentStorageType: type });
    
    // Se for sistema de arquivos, inicializar automaticamente
    if (type === 'filesystem') {
      try {
        const { directoryHandle, initializeFileSystem } = useFileNotesStore.getState();
        
        // Se já tem um diretório selecionado, inicializar
        if (directoryHandle) {
          console.log('🔧 Inicializando sistema de arquivos...');
          await initializeFileSystem();
        } else {
          console.log('⚠️ Sistema de arquivos configurado, mas diretório não selecionado ainda');
        }
      } catch (error) {
        console.error('Erro ao inicializar sistema de arquivos:', error);
        // Não falhar aqui, deixar o usuário tentar novamente
      }
    }
    
    set({ isReady: true });
  },
  
  initialize: () => {
    const { configuration } = useSetupStore.getState();
    
    if (configuration?.isConfigured) {
      set({ 
        currentStorageType: configuration.storageType,
        isReady: true 
      });
    }
  },
})); 