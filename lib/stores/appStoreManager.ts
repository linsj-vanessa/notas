import { create } from 'zustand';
import { useNotesStore } from '../store';
import { useFileNotesStore } from './fileNotesStore';
import { useSetupStore, type StorageType } from './setupStore';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';

interface AppStoreManager {
  currentStorageType: StorageType | null;
  effectiveStorageType: StorageType | null; // O tipo que está realmente sendo usado
  isReady: boolean;
  isInitializing: boolean;
  lastError: string | null;
  
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
  
  // Operações de lixeira
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  getTrashNotes: () => Promise<Note[]>;
  emptyTrash: () => Promise<void>;
  
  // Gerenciamento
  setStorageType: (type: StorageType) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  resetToIndexedDB: () => Promise<void>;
  
  // Re-autorização de diretório
  tryReauthorizeDirectory: () => Promise<boolean>;
  requestDirectoryReauthorization: () => Promise<boolean>;
}

export const useAppStoreManager = create<AppStoreManager>((set, get) => ({
  currentStorageType: null,
  effectiveStorageType: null,
  isReady: false,
  isInitializing: false,
  lastError: null,
  
  loadNotes: async () => {
    const { effectiveStorageType, isReady } = get();
    
    // Se não está pronto, aguardar inicialização
    if (!isReady) {
      console.log('⏳ AppStoreManager não inicializado, aguardando...');
      await get().initialize();
    }
    
    const finalStorageType = get().effectiveStorageType;
    
    try {
      if (finalStorageType === 'indexeddb') {
        const { loadNotes } = useNotesStore.getState();
        await loadNotes();
      } else if (finalStorageType === 'filesystem') {
        const { directories, loadNotesFromFiles, initializeFileSystem } = useFileNotesStore.getState();
        
        // Verificar se os diretórios estão inicializados
        if (!directories.notes || !directories.trash) {
          console.log('🔧 Diretórios não inicializados, tentando inicializar...');
          await initializeFileSystem();
        }
        
        await loadNotesFromFiles();
      } else {
        console.warn('❌ Nenhum tipo de armazenamento válido configurado, usando IndexedDB como fallback');
        await get().resetToIndexedDB();
        const { loadNotes } = useNotesStore.getState();
        await loadNotes();
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ Erro ao carregar notas:', errorMessage);
      
      // Se for erro de sistema de arquivos, fazer fallback para IndexedDB
      if (finalStorageType === 'filesystem' && (
        errorMessage.includes('diretório') || 
        errorMessage.includes('directory') ||
        errorMessage.includes('Nenhum diretório selecionado')
      )) {
        console.warn('🔄 Fallback: Sistema de arquivos falhou, usando IndexedDB temporariamente');
        await get().resetToIndexedDB();
        const { loadNotes } = useNotesStore.getState();
        await loadNotes();
      } else {
        set({ lastError: errorMessage });
        throw error;
      }
    }
  },
  
  createNote: async (data: CreateNoteData) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { createNote } = useNotesStore.getState();
      return await createNote(data);
    } else if (effectiveStorageType === 'filesystem') {
      const { createNote } = useFileNotesStore.getState();
      return await createNote(data);
    }
    
    throw new Error('Storage type not configured');
  },
  
  updateNote: async (id: string, data: UpdateNoteData) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { updateNote } = useNotesStore.getState();
      await updateNote(id, data);
    } else if (effectiveStorageType === 'filesystem') {
      const { updateNote } = useFileNotesStore.getState();
      await updateNote(id, data);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  deleteNote: async (id: string) => {
    const { effectiveStorageType } = get();
    
    try {
      if (effectiveStorageType === 'indexeddb') {
        // Para IndexedDB, usamos o método moveToTrash direto do notesStore
        const { moveToTrash } = useNotesStore.getState();
        await moveToTrash(id);
      } else if (effectiveStorageType === 'filesystem') {
        const { moveToTrash } = useFileNotesStore.getState();
        await moveToTrash(id);
      } else {
        throw new Error('Storage type not configured');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ Erro ao deletar nota:', errorMessage);
      
      // Se for erro de sistema de arquivos, fazer fallback para IndexedDB
      if (effectiveStorageType === 'filesystem' && (
        errorMessage.includes('diretório') || 
        errorMessage.includes('directory') ||
        errorMessage.includes('não inicializados')
      )) {
        console.warn('🔄 Fallback: Usando IndexedDB para deletar nota');
        await get().resetToIndexedDB();
        const { moveToTrash } = useNotesStore.getState();
        await moveToTrash(id);
      } else {
        throw error;
      }
    }
  },
  
  moveToTrash: async (id: string) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { moveToTrash } = useNotesStore.getState();
      await moveToTrash(id);
    } else if (effectiveStorageType === 'filesystem') {
      const { moveToTrash } = useFileNotesStore.getState();
      await moveToTrash(id);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  restoreFromTrash: async (id: string) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { restoreFromTrash } = useNotesStore.getState();
      await restoreFromTrash(id);
    } else if (effectiveStorageType === 'filesystem') {
      const { restoreFromTrash } = useFileNotesStore.getState();
      await restoreFromTrash(id);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  permanentDelete: async (id: string) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { permanentDelete } = useNotesStore.getState();
      await permanentDelete(id);
    } else if (effectiveStorageType === 'filesystem') {
      const { deleteNoteFile } = useFileNotesStore.getState();
      await deleteNoteFile(id);
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  getTrashNotes: async () => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { getTrashNotes } = useNotesStore.getState();
      return await getTrashNotes();
    } else if (effectiveStorageType === 'filesystem') {
      const { trashNotes } = useFileNotesStore.getState();
      return trashNotes;
    }
    
    return [];
  },
  
  emptyTrash: async () => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { emptyTrash } = useNotesStore.getState();
      await emptyTrash();
    } else if (effectiveStorageType === 'filesystem') {
      // Para filesystem, implementar esvaziamento da lixeira
      const { trashNotes } = useFileNotesStore.getState();
      for (const note of trashNotes) {
        await get().permanentDelete(note.id);
      }
    } else {
      throw new Error('Storage type not configured');
    }
  },
  
  setCurrentNote: (note: Note | null) => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { setCurrentNote } = useNotesStore.getState();
      setCurrentNote(note);
    } else if (effectiveStorageType === 'filesystem') {
      const { setCurrentNote } = useFileNotesStore.getState();
      setCurrentNote(note);
    }
  },
  
  getNotes: () => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { notes } = useNotesStore.getState();
      return notes;
    } else if (effectiveStorageType === 'filesystem') {
      const { notes } = useFileNotesStore.getState();
      return notes;
    }
    
    return [];
  },
  
  getCurrentNote: () => {
    const { effectiveStorageType } = get();
    
    if (effectiveStorageType === 'indexeddb') {
      const { currentNote } = useNotesStore.getState();
      return currentNote;
    } else if (effectiveStorageType === 'filesystem') {
      const { currentNote } = useFileNotesStore.getState();
      return currentNote;
    }
    
    return null;
  },
  
  getIsLoading: () => {
    const { isInitializing, effectiveStorageType } = get();
    
    if (isInitializing) return true;
    
    if (effectiveStorageType === 'indexeddb') {
      const { isLoading } = useNotesStore.getState();
      return isLoading;
    } else if (effectiveStorageType === 'filesystem') {
      const { isLoading } = useFileNotesStore.getState();
      return isLoading;
    }
    
    return false;
  },
  
  setStorageType: async (type: StorageType) => {
    set({ currentStorageType: type, isInitializing: true, lastError: null });

    try {
      if (type === 'filesystem') {
        const { directoryHandle } = useFileNotesStore.getState();
        
        // Verificar se há diretório selecionado
        if (!directoryHandle) {
          console.warn('⚠️ Sistema de arquivos configurado, mas diretório não selecionado');
          
          // Tentar re-autorizar diretório já autorizado anteriormente
          const reauthorized = await get().tryReauthorizeDirectory();
          
          if (!reauthorized) {
            console.log('🔄 Usando IndexedDB como fallback temporário');
            set({ 
              currentStorageType: type, // Manter a preferência configurada
              effectiveStorageType: 'indexeddb', // Mas usar IndexedDB efetivamente
              isReady: true, 
              isInitializing: false 
            });
            return;
          }
        }
        
        // Tentar inicializar o sistema de arquivos
        try {
          const { initializeFileSystem } = useFileNotesStore.getState();
          console.log('🔧 Inicializando sistema de arquivos...');
          await initializeFileSystem();
          
          set({ 
            effectiveStorageType: 'filesystem',
            isReady: true, 
            isInitializing: false 
          });
        } catch (error) {
          console.error('❌ Falha ao inicializar sistema de arquivos:', error);
          console.log('🔄 Usando IndexedDB como fallback');
          
          set({ 
            currentStorageType: type,
            effectiveStorageType: 'indexeddb',
            isReady: true, 
            isInitializing: false,
            lastError: (error as Error).message
          });
        }
      } else {
        // IndexedDB sempre funciona
        set({ 
          effectiveStorageType: 'indexeddb',
          isReady: true, 
          isInitializing: false 
        });
      }
    } catch (error) {
      console.error('❌ Erro ao configurar storage type:', error);
      set({ 
        effectiveStorageType: 'indexeddb', // Fallback
        isInitializing: false,
        lastError: (error as Error).message
      });
    }
  },

  // Tentar re-autorizar diretório já autorizado anteriormente
  tryReauthorizeDirectory: async (): Promise<boolean> => {
    try {
      const { hasDirectoryInfo, getDirectoryInfo, updateDirectoryInfo } = useSetupStore.getState();
      
      // Verificar se há informações sobre diretório já autorizado
      if (!hasDirectoryInfo()) {
        console.log('📁 Nenhum diretório foi autorizado anteriormente');
        return false;
      }
      
      const directoryInfo = getDirectoryInfo();
      if (!directoryInfo) {
        return false;
      }
      
      console.log('🔄 Tentando re-autorizar acesso ao diretório:', directoryInfo.name);
      
      // Verificar se File System Access API está disponível
      if (!('showDirectoryPicker' in window)) {
        console.warn('⚠️ File System Access API não suportado neste navegador');
        return false;
      }
      
      // Tentar obter acesso ao diretório através de seleção manual
      // Infelizmente, não há como re-acessar um diretório específico sem interação do usuário
      // O Chrome apenas oferece persistent permissions quando o usuário interage
      
      // Por enquanto, vamos apenas indicar que é necessário re-autorizar
      const { markDirectoryNeedsReauth } = useSetupStore.getState();
      markDirectoryNeedsReauth();
      
      console.log('🔄 Re-autorização necessária - usuário precisa selecionar pasta novamente');
      return false;
      
    } catch (error) {
      console.error('❌ Erro ao tentar re-autorizar diretório:', error);
      return false;
    }
  },

  // Função para lidar com re-autorização manual
  requestDirectoryReauthorization: async (): Promise<boolean> => {
    try {
      console.log('📁 Solicitando re-autorização manual do diretório...');
      
      // Solicitar seleção de diretório
      const directoryHandle = await (window as typeof window & {
        showDirectoryPicker: (options?: { mode?: string }) => Promise<FileSystemDirectoryHandle>
      }).showDirectoryPicker({
        mode: 'readwrite',
      });
      
      // Atualizar fileNotesStore com novo handle
      const { setDirectoryHandle } = useFileNotesStore.getState();
      setDirectoryHandle(directoryHandle);
      
      // Atualizar setupStore com novas informações
      const { updateDirectoryInfo } = useSetupStore.getState();
      updateDirectoryInfo(directoryHandle);
      
      console.log('✅ Diretório re-autorizado com sucesso:', directoryHandle.name);
      
      // Tentar inicializar filesystem novamente
      await get().setStorageType('filesystem');
      
      return true;
    } catch (error) {
      console.error('❌ Erro na re-autorização manual:', error);
      return false;
    }
  },
  
  initialize: async () => {
    const { isInitializing, isReady } = get();
    
    // Evitar múltiplas inicializações simultâneas
    if (isInitializing || isReady) return;
    
    set({ isInitializing: true, lastError: null });
    
    try {
      const { configuration } = useSetupStore.getState();
      
      if (configuration?.isConfigured) {
        await get().setStorageType(configuration.storageType);
      } else {
        console.log('⚠️ Configuração não encontrada, usando IndexedDB como padrão');
        set({ 
          currentStorageType: 'indexeddb',
          effectiveStorageType: 'indexeddb',
          isReady: true,
          isInitializing: false 
        });
      }
    } catch (error) {
      console.error('❌ Erro na inicialização do AppStoreManager:', error);
      set({ 
        effectiveStorageType: 'indexeddb', // Sempre usar IndexedDB como último recurso
        isInitializing: false,
        lastError: (error as Error).message
      });
    }
  },
  
  clearError: () => {
    set({ lastError: null });
  },
  
  resetToIndexedDB: async () => {
    console.log('🔄 Resetando para IndexedDB...');
    set({ 
      effectiveStorageType: 'indexeddb',
      lastError: null 
    });
  },
})); 