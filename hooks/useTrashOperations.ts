import { useState, useCallback, useEffect } from 'react';
import { useNotesStore } from '@/lib/store';
import { useCleanupScheduler } from '@/lib/cleanup-scheduler';

export const useTrashOperations = () => {
  const { 
    moveToTrash, 
    restoreFromTrash, 
    permanentDelete, 
    getTrashNotes, 
    emptyTrash 
  } = useNotesStore();

  const { startCleanup, stopCleanup, runManualCleanup } = useCleanupScheduler();

  const [trashCount, setTrashCount] = useState(0);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateTrashCount = useCallback(async () => {
    try {
      const trashNotes = await getTrashNotes();
      setTrashCount(trashNotes.length);
    } catch (error) {
      console.error('Error updating trash count:', error);
    }
  }, [getTrashNotes]);

  const handleMoveToTrash = useCallback(async (id: string) => {
    try {
      await moveToTrash(id);
      await updateTrashCount();
    } catch (error) {
      console.error('Error moving note to trash:', error);
      throw error;
    }
  }, [moveToTrash, updateTrashCount]);

  const handleRestoreFromTrash = useCallback(async (id: string) => {
    setIsRestoring(true);
    try {
      await restoreFromTrash(id);
      await updateTrashCount();
    } catch (error) {
      console.error('Error restoring note from trash:', error);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, [restoreFromTrash, updateTrashCount]);

  const handlePermanentDelete = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await permanentDelete(id);
      await updateTrashCount();
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [permanentDelete, updateTrashCount]);

  const handleEmptyTrash = useCallback(async () => {
    setIsEmptyingTrash(true);
    try {
      await emptyTrash();
      await updateTrashCount();
    } catch (error) {
      console.error('Error emptying trash:', error);
      throw error;
    } finally {
      setIsEmptyingTrash(false);
    }
  }, [emptyTrash, updateTrashCount]);

  const handleRunManualCleanup = useCallback(async () => {
    try {
      await runManualCleanup();
      await updateTrashCount();
    } catch (error) {
      console.error('Error running manual cleanup:', error);
      throw error;
    }
  }, [runManualCleanup, updateTrashCount]);

  // Inicializar contador da lixeira e scheduler
  useEffect(() => {
    updateTrashCount();
    startCleanup();
    
    const interval = setInterval(updateTrashCount, 30000); // Atualizar a cada 30 segundos
    
    return () => {
      clearInterval(interval);
      stopCleanup();
    };
  }, [updateTrashCount, startCleanup, stopCleanup]);

  return {
    trashCount,
    handleMoveToTrash,
    handleRestoreFromTrash,
    handlePermanentDelete,
    handleEmptyTrash,
    handleRunManualCleanup,
    updateTrashCount,
    isEmptyingTrash,
    isRestoring,
    isDeleting,
  };
}; 