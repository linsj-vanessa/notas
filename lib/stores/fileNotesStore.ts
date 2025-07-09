import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';
import { getFileSystemService } from '@/lib/file-system/FileSystemService';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';
import { FileSystemError, FileSystemErrorCode } from '@/lib/file-system/types';

interface FileSystemState {
  directoryHandle: FileSystemDirectoryHandle | null;
  isFileSystemEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Estrutura de diretórios
  directories: {
    notes: FileSystemDirectoryHandle | null;
    metadata: FileSystemDirectoryHandle | null;
    trash: FileSystemDirectoryHandle | null;
  };
  
  // Cache de notas
  notes: Note[];
  trashNotes: Note[];
  currentNote: Note | null;
  
  // Sincronização
  lastSync: Date | null;
  pendingChanges: Set<string>;
  
  // Configuração
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  setFileSystemEnabled: (enabled: boolean) => void;
  
  // Inicialização
  initializeFileSystem: () => Promise<void>;
  
  // Operações de notas
  loadNotesFromFiles: () => Promise<void>;
  saveNoteToFile: (note: Note) => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Operações de arquivo
  deleteNoteFile: (noteId: string) => Promise<void>;
  moveToTrash: (noteId: string) => Promise<void>;
  restoreFromTrash: (noteId: string) => Promise<void>;
  
  // Sincronização
  syncWithFileSystem: () => Promise<void>;
  
  // Utilitários
  setCurrentNote: (note: Note | null) => void;
  getFilteredNotes: (searchTerm?: string) => Note[];
  clearError: () => void;
}

export const useFileNotesStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      directoryHandle: null,
      isFileSystemEnabled: false,
      isLoading: false,
      error: null,
      
      directories: {
        notes: null,
        metadata: null,
        trash: null,
      },
      
      notes: [],
      trashNotes: [],
      currentNote: null,
      
      lastSync: null,
      pendingChanges: new Set(),
      
      // Configuração
      setDirectoryHandle: (handle) => {
        set({ directoryHandle: handle });
      },
      
      setFileSystemEnabled: (enabled) => {
        set({ isFileSystemEnabled: enabled });
      },
      
      // Inicialização
      initializeFileSystem: async () => {
        const { directoryHandle } = get();
        if (!directoryHandle) {
          throw new Error('Nenhum diretório selecionado');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const fileSystemService = getFileSystemService();
          const directories = await fileSystemService.initializeDirectoryStructure(directoryHandle);
          
          set({
            directories: {
              notes: directories.notesDir,
              metadata: directories.metadataDir,
              trash: directories.trashDir,
            },
            isFileSystemEnabled: true,
            isLoading: false,
          });
          
          // Carregar notas após inicialização
          await get().loadNotesFromFiles();
          
        } catch (error) {
          set({
            error: `Erro ao inicializar sistema de arquivos: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Carregar notas dos arquivos
      loadNotesFromFiles: async () => {
        const { directories } = get();
        if (!directories.notes || !directories.trash) {
          throw new Error('Diretórios não inicializados');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const fileSystemService = getFileSystemService();
          
          // Carregar notas ativas
          const noteFiles = await fileSystemService.listFiles(directories.notes);
          const notes: Note[] = [];
          
          for (const file of noteFiles) {
            try {
              const content = await fileSystemService.readFile(file);
              const note = markdownConverter.fromMarkdown(content);
              notes.push(note);
            } catch (error) {
              console.error(`Erro ao carregar nota ${file.name}:`, error);
            }
          }
          
          // Carregar notas da lixeira
          const trashFiles = await fileSystemService.listFiles(directories.trash);
          const trashNotes: Note[] = [];
          
          for (const file of trashFiles) {
            try {
              const content = await fileSystemService.readFile(file);
              const note = markdownConverter.fromMarkdown(content);
              trashNotes.push(note);
            } catch (error) {
              console.error(`Erro ao carregar nota da lixeira ${file.name}:`, error);
            }
          }
          
          set({
            notes: notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
            trashNotes: trashNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
            lastSync: new Date(),
            isLoading: false,
          });
          
        } catch (error) {
          set({
            error: `Erro ao carregar notas: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Salvar nota em arquivo
      saveNoteToFile: async (note: Note) => {
        const { directories } = get();
        if (!directories.notes) {
          throw new Error('Diretório de notas não inicializado');
        }
        
        try {
          const fileSystemService = getFileSystemService();
          const markdown = markdownConverter.toMarkdown(note);
          const fileName = markdownConverter.generateFileName(note.title);
          
          const fileHandle = await fileSystemService.getFileHandle(directories.notes, fileName, true);
          await fileSystemService.writeFile(fileHandle, markdown);
          
          // Remover das mudanças pendentes
          const { pendingChanges } = get();
          pendingChanges.delete(note.id);
          set({ pendingChanges: new Set(pendingChanges) });
          
        } catch (error) {
          throw new Error(`Erro ao salvar nota: ${(error as Error).message}`);
        }
      },
      
      // Criar nova nota
      createNote: async (data: CreateNoteData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { note, markdown } = markdownConverter.createNoteToMarkdown(data);
          
          // Salvar arquivo
          await get().saveNoteToFile(note);
          
          // Atualizar estado
          set((state) => ({
            notes: [note, ...state.notes],
            currentNote: note,
            isLoading: false,
          }));
          
          return note;
          
        } catch (error) {
          set({
            error: `Erro ao criar nota: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Atualizar nota
      updateNote: async (id: string, data: UpdateNoteData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { notes } = get();
          const existingNote = notes.find(note => note.id === id);
          
          if (!existingNote) {
            throw new Error('Nota não encontrada');
          }
          
          const { note: updatedNote } = markdownConverter.updateNoteToMarkdown(existingNote, data);
          
          // Salvar arquivo
          await get().saveNoteToFile(updatedNote);
          
          // Atualizar estado
          set((state) => ({
            notes: state.notes.map(note => 
              note.id === id ? updatedNote : note
            ),
            currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
            isLoading: false,
          }));
          
        } catch (error) {
          set({
            error: `Erro ao atualizar nota: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Deletar nota (mover para lixeira)
      deleteNote: async (id: string) => {
        try {
          await get().moveToTrash(id);
        } catch (error) {
          throw error;
        }
      },
      
      // Deletar arquivo de nota
      deleteNoteFile: async (noteId: string) => {
        const { directories, notes } = get();
        if (!directories.notes) {
          throw new Error('Diretório de notas não inicializado');
        }
        
        try {
          const note = notes.find(n => n.id === noteId);
          if (!note) {
            throw new Error('Nota não encontrada');
          }
          
          const fileSystemService = getFileSystemService();
          const fileName = markdownConverter.generateFileName(note.title);
          
          // Verificar se arquivo existe
          const fileExists = await fileSystemService.fileExists(directories.notes, fileName);
          if (fileExists) {
            const fileHandle = await fileSystemService.getFileHandle(directories.notes, fileName);
            // Note: File System Access API não tem delete direto, por isso usamos moveToTrash
            await get().moveToTrash(noteId);
          }
          
        } catch (error) {
          throw new Error(`Erro ao deletar arquivo: ${(error as Error).message}`);
        }
      },
      
      // Mover para lixeira
      moveToTrash: async (noteId: string) => {
        const { directories, notes } = get();
        if (!directories.notes || !directories.trash) {
          throw new Error('Diretórios não inicializados');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const note = notes.find(n => n.id === noteId);
          if (!note) {
            throw new Error('Nota não encontrada');
          }
          
          const fileSystemService = getFileSystemService();
          
          // Atualizar nota para marcá-la como deletada
          const trashedNote: Note = {
            ...note,
            isDeleted: true,
            deletedAt: new Date(),
          };
          
          // Salvar na lixeira
          const markdown = markdownConverter.toMarkdown(trashedNote);
          const fileName = markdownConverter.generateFileName(trashedNote.title);
          
          const trashFileHandle = await fileSystemService.getFileHandle(directories.trash, fileName, true);
          await fileSystemService.writeFile(trashFileHandle, markdown);
          
          // Remover arquivo original (se existir)
          const originalFileName = markdownConverter.generateFileName(note.title);
          const originalExists = await fileSystemService.fileExists(directories.notes, originalFileName);
          if (originalExists) {
            // Como não podemos deletar diretamente, vamos apenas remover do estado
            // O arquivo original pode ser removido manualmente pelo usuário
          }
          
          // Atualizar estado
          set((state) => ({
            notes: state.notes.filter(n => n.id !== noteId),
            trashNotes: [trashedNote, ...state.trashNotes],
            currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
            isLoading: false,
          }));
          
        } catch (error) {
          set({
            error: `Erro ao mover para lixeira: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Restaurar da lixeira
      restoreFromTrash: async (noteId: string) => {
        const { directories, trashNotes } = get();
        if (!directories.notes || !directories.trash) {
          throw new Error('Diretórios não inicializados');
        }
        
        try {
          set({ isLoading: true, error: null });
          
          const note = trashNotes.find(n => n.id === noteId);
          if (!note) {
            throw new Error('Nota não encontrada na lixeira');
          }
          
          const fileSystemService = getFileSystemService();
          
          // Restaurar nota
          const restoredNote: Note = {
            ...note,
            isDeleted: false,
            deletedAt: undefined,
          };
          
          // Salvar nas notas ativas
          const markdown = markdownConverter.toMarkdown(restoredNote);
          const fileName = markdownConverter.generateFileName(restoredNote.title);
          
          const noteFileHandle = await fileSystemService.getFileHandle(directories.notes, fileName, true);
          await fileSystemService.writeFile(noteFileHandle, markdown);
          
          // Remover da lixeira
          const trashFileName = markdownConverter.generateFileName(note.title);
          const trashExists = await fileSystemService.fileExists(directories.trash, trashFileName);
          if (trashExists) {
            // Remover do estado (arquivo pode ser removido manualmente)
          }
          
          // Atualizar estado
          set((state) => ({
            notes: [restoredNote, ...state.notes],
            trashNotes: state.trashNotes.filter(n => n.id !== noteId),
            isLoading: false,
          }));
          
        } catch (error) {
          set({
            error: `Erro ao restaurar da lixeira: ${(error as Error).message}`,
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Sincronizar com sistema de arquivos
      syncWithFileSystem: async () => {
        try {
          await get().loadNotesFromFiles();
        } catch (error) {
          throw error;
        }
      },
      
      // Utilitários
      setCurrentNote: (note: Note | null) => {
        set({ currentNote: note });
      },
      
      getFilteredNotes: (searchTerm = '') => {
        const { notes } = get();
        if (!searchTerm) return notes;
        
        const term = searchTerm.toLowerCase();
        return notes.filter(note => 
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          note.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'file-notes-storage',
      partialize: (state) => ({
        directoryHandle: null, // Não persistir handles (não são serializáveis)
        isFileSystemEnabled: state.isFileSystemEnabled,
        currentNote: state.currentNote,
        lastSync: state.lastSync,
      }),
    }
  )
);

export default useFileNotesStore; 