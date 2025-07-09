import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/note';
import { db } from '@/lib/db';
import { notificationService } from '@/lib/notification-service';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  
  // Actions
  loadNotes: () => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isLoading: false,

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
          
          // Registrar atividade de escrita para notificações
          notificationService.registerWritingActivity();
          
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
          
          // Registrar atividade de escrita para notificações
          notificationService.registerWritingActivity();
          
        } catch (error) {
          console.error('Error updating note:', error);
          throw error;
        }
      },

      setCurrentNote: (note: Note | null) => {
        set({ currentNote: note });
      },
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ 
        currentNote: state.currentNote
      }),
    }
  )
); 