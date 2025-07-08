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
          const notes = await db.notes.orderBy('updatedAt').reverse().toArray();
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
        try {
          await db.notes.delete(id);
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
          }));
        } catch (error) {
          console.error('Error deleting note:', error);
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