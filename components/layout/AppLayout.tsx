'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Menu, FileText, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { useNotesStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ThemeSelector from '@/components/ui/theme-selector';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { TrashView } from '@/components/ui/trash-view';
import { useCleanupScheduler } from '@/lib/cleanup-scheduler';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const {
    notes,
    currentNote,
    isLoading,
    searchTerm,
    loadNotes,
    createNote,
    deleteNote,
    setCurrentNote,
    setSearchTerm,
    getFilteredNotes,
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
    const interval = setInterval(updateTrashCount, 30000); // Atualizar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Inicializar scheduler de limpeza
  useEffect(() => {
    startCleanup();
    
    // Cleanup ao desmontar
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

  const handleSelectNote = (note: any) => {
    setCurrentNote(note);
  };

  const handleDeleteNote = (noteId: string, noteTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que a nota seja selecionada ao clicar no delete
    
    // Abre o modal de confirmação
    setDeleteModal({
      isOpen: true,
      noteId,
      noteTitle: noteTitle || 'Nota sem título'
    });
  };

  // Função para confirmar a exclusão
  const confirmDeleteNote = async () => {
    try {
      await deleteNote(deleteModal.noteId);
      // Atualizar contador da lixeira após deletar
      updateTrashCount();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erro ao apagar a nota. Tente novamente.');
    }
  };

  // Função para fechar o modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      noteId: '',
      noteTitle: ''
    });
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg">Notas App</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <ThemeSelector />
          <Button size="sm" onClick={handleCreateNote}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-background overflow-y-auto notion-scrollbar">
          <div className="p-4">
            <div className="space-y-4">
              {/* Navegação */}
              <div className="space-y-2">
                <Button
                  variant={!showTrash ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowTrash(false)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Notas ({filteredNotes.length})
                </Button>
                <Button
                  variant={showTrash ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start relative"
                  onClick={() => setShowTrash(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Lixeira
                  {trashCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {trashCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Lista de notas - só mostra se não estiver na lixeira */}
              {!showTrash && (
                <div className="space-y-2">
                  <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Suas Notas ({filteredNotes.length})
                  </h2>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground p-2">
                    Carregando...
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">
                    {searchTerm ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`group relative w-full text-left p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer ${
                        currentNote?.id === note.id
                          ? 'bg-muted border-border'
                          : ''
                      }`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm">
                            {note.title || 'Nota sem título'}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {note.content || 'Nota vazia'}
                          </p>
                          
                          {/* Apenas timestamp da última modificação */}
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(note.updatedAt, {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Botão de deletar - aparece no hover */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteNote(note.id, note.title, e)}
                          title="Apagar nota"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {showTrash ? <TrashView /> : children}
        </main>
      </div>

      {/* Modal de Confirmação */}
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