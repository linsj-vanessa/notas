'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNotesStore } from '@/lib/stores';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { TrashView } from '@/components/ui/trash-view';
import { useNoteOperations } from '@/hooks/useNoteOperations';
import { useTrashOperations } from '@/hooks/useTrashOperations';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Note } from '@/types/note';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { loadNotes } = useNotesStore();
  
  const { 
    handleCreateNote: createNoteHook, 
    handleSelectNote, 
    handleDeleteNote: deleteNoteHook,
    getTextFromHtml 
  } = useNoteOperations();
  
  const { 
    trashCount, 
    updateTrashCount 
  } = useTrashOperations();

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

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Função para criar nova nota e redirecionar
  const handleCreateNote = async () => {
    try {
      await createNoteHook();
      // Redirecionar para a página principal onde está o editor
      if (pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
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
      await deleteNoteHook(deleteModal.noteId);
      await updateTrashCount();
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

  // Função para selecionar nota e redirecionar se necessário
  const handleSelectNoteWithNavigation = (note: Note) => {
    handleSelectNote(note);
    // Se não estiver na página principal, redirecionar
    if (pathname !== '/') {
      router.push('/');
    }
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
          onSelectNote={handleSelectNoteWithNavigation}
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