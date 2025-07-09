'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useNotesStore } from '@/lib/store';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { TrashView } from '@/components/ui/trash-view';
import { useCleanupScheduler } from '@/lib/cleanup-scheduler';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Note } from '@/types/note';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Função para extrair texto puro do HTML
  const getTextFromHtml = (html: string): string => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    return textContent.replace(/\s+/g, ' ').trim();
  };
  
  const {
    loadNotes,
    createNote,
    deleteNote,
    setCurrentNote,
  } = useNotesStore();

  // Estado para controlar o modal de confirmação
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteId: string;
    noteTitle: string;
  }>({
    isOpen: false,
    noteId: '',
    noteTitle: ''
  });

  // Estado para controlar se estamos visualizando a lixeira
  const [showTrash, setShowTrash] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  // Scheduler para limpeza automática
  const { startCleanup, stopCleanup } = useCleanupScheduler();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Função para atualizar contador da lixeira
  const updateTrashCount = async () => {
    try {
      const { getTrashNotes } = useNotesStore.getState();
      const trashNotes = await getTrashNotes();
      setTrashCount(trashNotes.length);
    } catch (error) {
      console.error('Error updating trash count:', error);
    }
  };

  // Atualizar contador da lixeira periodicamente
  useEffect(() => {
    updateTrashCount();
    const interval = setInterval(updateTrashCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Inicializar scheduler de limpeza
  useEffect(() => {
    startCleanup();
    
    return () => {
      stopCleanup();
    };
  }, [startCleanup, stopCleanup]);

  const handleCreateNote = async () => {
    try {
      await createNote({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleSelectNote = (note: Note) => {
    setCurrentNote(note);
  };

  const handleDeleteNote = (noteId: string, noteTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setDeleteModal({
      isOpen: true,
      noteId,
      noteTitle: noteTitle || 'Nota sem título'
    });
  };

  const confirmDeleteNote = async () => {
    try {
      await deleteNote(deleteModal.noteId);
      updateTrashCount();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erro ao apagar a nota. Tente novamente.');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      noteId: '',
      noteTitle: ''
    });
  };

  const handleNavigateToTrash = () => {
    setShowTrash(true);
  };

  const handleNavigateToNotes = () => {
    setShowTrash(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <AppHeader onCreateNote={handleCreateNote} />

      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          showTrash={showTrash}
          trashCount={trashCount}
          onNavigateToTrash={handleNavigateToTrash}
          onNavigateToNotes={handleNavigateToNotes}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          getTextFromHtml={getTextFromHtml}
        />

        <main className="flex-1 overflow-hidden">
          {showTrash ? <TrashView /> : children}
        </main>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteNote}
        title="Apagar Nota"
        message={`Tem certeza que deseja apagar a nota "${deleteModal.noteTitle}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Apagar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
} 