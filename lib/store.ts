import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';
import { db } from '@/lib/db';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  searchTerm: string;
  isFocusMode: boolean;
  
  // Actions
  loadNotes: () => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  setSearchTerm: (term: string) => void;
  setFocusMode: (enabled: boolean) => void;
  getFilteredNotes: () => Note[];
  
  // Trash functions
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  getTrashNotes: () => Promise<Note[]>;
  emptyTrash: () => Promise<void>;
  cleanupOldTrash: () => Promise<void>;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isLoading: false,
      searchTerm: '',
      isFocusMode: false,

      loadNotes: async () => {
        set({ isLoading: true });
        try {
          // Carregar apenas notas não deletadas
          const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
          const notes = allNotes.filter(note => !note.isDeleted);
          set({ notes, isLoading: false });
        } catch (error) {
          console.error('Error loading notes:', error);
          set({ isLoading: false });
        }
      },

      createNote: async (data: CreateNoteData) => {
        const now = new Date();
        const note: Note = {
          id: crypto.randomUUID(),
          title: data.title || '',
          content: data.content || '',
          createdAt: now,
          updatedAt: now,
          tags: data.tags || [],
          isDeleted: false,
        };

        try {
          await db.notes.add(note);
          set((state) => ({
            notes: [note, ...state.notes],
            currentNote: note,
          }));
          return note;
        } catch (error) {
          console.error('Error creating note:', error);
          throw error;
        }
      },

      updateNote: async (id: string, data: UpdateNoteData) => {
        try {
          const updatedData = {
            ...data,
            updatedAt: new Date(),
          };

          await db.notes.update(id, updatedData);
          
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, ...updatedData } : note
            ),
            currentNote: state.currentNote?.id === id 
              ? { ...state.currentNote, ...updatedData }
              : state.currentNote,
          }));
        } catch (error) {
          console.error('Error updating note:', error);
          throw error;
        }
      },

      deleteNote: async (id: string) => {
        // Agora deleteNote move para a lixeira ao invés de deletar permanentemente
        await get().moveToTrash(id);
      },

      moveToTrash: async (id: string) => {
        try {
          const now = new Date();
          await db.notes.update(id, {
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          });
          
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
          }));
        } catch (error) {
          console.error('Error moving note to trash:', error);
          throw error;
        }
      },

      restoreFromTrash: async (id: string) => {
        try {
          const now = new Date();
          // Primeiro buscar a nota
          const note = await db.notes.get(id);
          if (note) {
            // Atualizar removendo deletedAt
            const { deletedAt, ...noteWithoutDeletedAt } = note;
            await db.notes.put({
              ...noteWithoutDeletedAt,
              isDeleted: false,
              updatedAt: now,
            });
          }
          
          // Recarregar notas para incluir a restaurada
          await get().loadNotes();
        } catch (error) {
          console.error('Error restoring note from trash:', error);
          throw error;
        }
      },

      permanentDelete: async (id: string) => {
        try {
          await db.notes.delete(id);
        } catch (error) {
          console.error('Error permanently deleting note:', error);
          throw error;
        }
      },

      getTrashNotes: async () => {
        try {
          const allNotes = await db.notes.toArray();
          const trashNotes = allNotes
            .filter(note => note.isDeleted)
            .sort((a, b) => {
              if (!a.deletedAt) return 1;
              if (!b.deletedAt) return -1;
              return b.deletedAt.getTime() - a.deletedAt.getTime();
            });
          return trashNotes;
        } catch (error) {
          console.error('Error loading trash notes:', error);
          return [];
        }
      },

      emptyTrash: async () => {
        try {
          const trashNotes = await get().getTrashNotes();
          for (const note of trashNotes) {
            await db.notes.delete(note.id);
          }
        } catch (error) {
          console.error('Error emptying trash:', error);
          throw error;
        }
      },

      cleanupOldTrash: async () => {
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const allNotes = await db.notes.toArray();
          const oldTrashNotes = allNotes.filter(note => 
            note.isDeleted && note.deletedAt && note.deletedAt < thirtyDaysAgo
          );
          
          for (const note of oldTrashNotes) {
            await db.notes.delete(note.id);
          }
        } catch (error) {
          console.error('Error cleaning up old trash:', error);
          throw error;
        }
      },

      setCurrentNote: (note: Note | null) => {
        set({ currentNote: note });
      },

      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
      },

      setFocusMode: (enabled: boolean) => {
        set({ isFocusMode: enabled });
      },

      getFilteredNotes: () => {
        const { notes, searchTerm } = get();
        
        if (!searchTerm) {
          return notes;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        return notes.filter(
          (note) =>
            note.title.toLowerCase().includes(lowerSearchTerm) ||
            note.content.toLowerCase().includes(lowerSearchTerm) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
        );
      },
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ 
        currentNote: state.currentNote,
        searchTerm: state.searchTerm,
        isFocusMode: state.isFocusMode
      }),
    }
  )
); 