'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { useTrashStore } from '@/lib/stores';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export function TrashView() {
  const [trashNotes, setTrashNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  const { getTrashNotes, restoreFromTrash, permanentDelete, emptyTrash } = useTrashStore();

  const loadTrashNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await getTrashNotes();
      setTrashNotes(notes);
    } catch (error) {
      console.error('Error loading trash notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrashNotes();
  }, []);

  const handleRestore = async (noteId: string) => {
    try {
      await restoreFromTrash(noteId);
      await loadTrashNotes();
    } catch (error) {
      console.error('Error restoring note:', error);
    }
  };

  const handlePermanentDelete = async (noteId: string) => {
    try {
      await permanentDelete(noteId);
      await loadTrashNotes();
    } catch (error) {
      console.error('Error permanently deleting note:', error);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash();
      await loadTrashNotes();
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPreviewText = (content: string) => {
    // Remove HTML tags para preview
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando lixeira...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-gray-600" />
          <h1 className="text-2xl font-bold">Lixeira</h1>
          <span className="text-gray-500">({trashNotes.length} notas)</span>
        </div>
        
        {trashNotes.length > 0 && (
          <Button
            onClick={() => setShowEmptyTrashModal(true)}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Esvaziar Lixeira
          </Button>
        )}
      </div>

      {trashNotes.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Lixeira vazia</h2>
          <p className="text-gray-500">Nenhuma nota foi deletada recentemente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trashNotes.map((note) => (
            <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {note.title || 'Sem título'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {getPreviewText(note.content)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Deletada: {formatDate(note.deletedAt)}</span>
                    <span>Criada: {formatDate(note.createdAt)}</span>
                    {note.tags && note.tags.length > 0 && (
                      <span>Tags: {note.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleRestore(note.id)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restaurar
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setShowPermanentDeleteModal(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para confirmar esvaziar lixeira */}
      <ConfirmationModal
        isOpen={showEmptyTrashModal}
        onClose={() => setShowEmptyTrashModal(false)}
        onConfirm={() => {
          handleEmptyTrash();
          setShowEmptyTrashModal(false);
        }}
        title="Esvaziar Lixeira"
        message={`Tem certeza que deseja deletar permanentemente todas as ${trashNotes.length} notas da lixeira? Esta ação não pode ser desfeita.`}
        confirmText="Esvaziar Lixeira"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Modal para confirmar deletar permanentemente */}
      <ConfirmationModal
        isOpen={showPermanentDeleteModal}
        onClose={() => {
          setShowPermanentDeleteModal(false);
          setSelectedNoteId(null);
        }}
        onConfirm={() => {
          if (selectedNoteId) {
            handlePermanentDelete(selectedNoteId);
          }
          setShowPermanentDeleteModal(false);
          setSelectedNoteId(null);
        }}
        title="Deletar Permanentemente"
        message="Tem certeza que deseja deletar permanentemente esta nota? Esta ação não pode ser desfeita."
        confirmText="Deletar Permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
} 