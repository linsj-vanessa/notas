import { create } from 'zustand';
import { Note } from '@/types/note';
import { db } from '@/lib/db';
import { useNotesStore } from './notesStore';

interface TrashState {
  // Actions
  deleteNote: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  getTrashNotes: () => Promise<Note[]>;
  emptyTrash: () => Promise<void>;
  cleanupOldTrash: () => Promise<void>;
}

export const useTrashStore = create<TrashState>()((set, get) => ({
  deleteNote: async (id: string) => {
    // deleteNote move para a lixeira ao invés de deletar permanentemente
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
      
      // Atualizar o store de notas para remover a nota da lista
      const notesStore = useNotesStore.getState();
      await notesStore.loadNotes();
      
      // Se a nota deletada era a atual, limpar seleção
      if (notesStore.currentNote?.id === id) {
        notesStore.setCurrentNote(null);
      }
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
      const notesStore = useNotesStore.getState();
      await notesStore.loadNotes();
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
})); 