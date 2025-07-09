'use client';

import { Button } from '@/components/ui/button';
import { FileText, Clock, Trash2 } from 'lucide-react';
import { useNotesStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Note } from '@/types/note';

interface NotesListProps {
  showTrash: boolean;
  pathname: string;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string, noteTitle: string, e: React.MouseEvent) => void;
  getTextFromHtml: (html: string) => string;
}

export default function NotesList({ 
  showTrash, 
  pathname,
  onSelectNote,
  onDeleteNote,
  getTextFromHtml
}: NotesListProps) {
  const { 
    isLoading, 
    searchTerm, 
    currentNote, 
    getFilteredNotes 
  } = useNotesStore();

  const filteredNotes = getFilteredNotes();

  // Não mostrar lista se estiver na lixeira ou no dashboard
  if (showTrash || pathname !== '/') {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Suas Notas
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
              onClick={() => onSelectNote(note)}
            >
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-sm">
                    {note.title || 'Nota sem título'}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {getTextFromHtml(note.content) || 'Nota vazia'}
                  </p>
                  
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
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => onDeleteNote(note.id, note.title, e)}
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
  );
} 