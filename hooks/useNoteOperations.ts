import { useState, useCallback } from 'react';
import { useNotesStore, useTrashStore } from '@/lib/stores';
import { Note } from '@/types/note';

export const useNoteOperations = () => {
  const { 
    createNote, 
    updateNote, 
    setCurrentNote 
  } = useNotesStore();
  
  const { deleteNote } = useTrashStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateNote = useCallback(async () => {
    setIsCreating(true);
    try {
      const note = await createNote({ title: '', content: '' });
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [createNote]);

  const handleUpdateNote = useCallback(async (id: string, data: { title?: string; content?: string }) => {
    setIsUpdating(true);
    try {
      await updateNote(id, data);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateNote]);

  const handleDeleteNote = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [deleteNote]);

  const handleSelectNote = useCallback((note: Note) => {
    setCurrentNote(note);
  }, [setCurrentNote]);

  const getTextFromHtml = useCallback((html: string): string => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    return textContent.replace(/\s+/g, ' ').trim();
  }, []);

  return {
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleSelectNote,
    getTextFromHtml,
    isCreating,
    isUpdating,
    isDeleting,
  };
}; 