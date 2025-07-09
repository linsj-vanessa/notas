import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '@/types/note';
import { useNotesStore } from './notesStore';

interface UIState {
  searchTerm: string;
  isFocusMode: boolean;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFocusMode: (enabled: boolean) => void;
  getFilteredNotes: () => Note[];
  clearSearch: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      searchTerm: '',
      isFocusMode: false,

      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
      },

      setFocusMode: (enabled: boolean) => {
        set({ isFocusMode: enabled });
      },

      clearSearch: () => {
        set({ searchTerm: '' });
      },

      getFilteredNotes: () => {
        const { searchTerm } = get();
        const { notes } = useNotesStore.getState();
        
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
      name: 'ui-storage',
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        isFocusMode: state.isFocusMode,
      }),
    }
  )
); 