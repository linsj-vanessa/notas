// Export all specialized stores
export { useNotesStore } from './notesStore';
export { useTrashStore } from './trashStore';
export { useUIStore } from './uiStore';
export { useSetupStore, type StorageType, type SetupConfiguration } from './setupStore';
export { useFileNotesStore } from './fileNotesStore';
export { useAppStoreManager } from './appStoreManager';

// Import stores for combined hook
import { useNotesStore } from './notesStore';
import { useTrashStore } from './trashStore';
import { useUIStore } from './uiStore';

// Combined store hook for convenience (backward compatibility)
export const useAppStore = () => {
  const notesStore = useNotesStore();
  const trashStore = useTrashStore();
  const uiStore = useUIStore();

  return {
    // Notes state and actions
    notes: notesStore.notes,
    currentNote: notesStore.currentNote,
    isLoading: notesStore.isLoading,
    loadNotes: notesStore.loadNotes,
    createNote: notesStore.createNote,
    updateNote: notesStore.updateNote,
    setCurrentNote: notesStore.setCurrentNote,

    // Trash actions
    deleteNote: trashStore.deleteNote,
    moveToTrash: trashStore.moveToTrash,
    restoreFromTrash: trashStore.restoreFromTrash,
    permanentDelete: trashStore.permanentDelete,
    getTrashNotes: trashStore.getTrashNotes,
    emptyTrash: trashStore.emptyTrash,
    cleanupOldTrash: trashStore.cleanupOldTrash,

    // UI state and actions
    searchTerm: uiStore.searchTerm,
    isFocusMode: uiStore.isFocusMode,
    setSearchTerm: uiStore.setSearchTerm,
    setFocusMode: uiStore.setFocusMode,
    getFilteredNotes: uiStore.getFilteredNotes,
    clearSearch: uiStore.clearSearch,
  };
}; 