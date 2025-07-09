'use client';

import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useUIStore } from '@/lib/stores';
import { useAppStoreManager } from '@/lib/stores/appStoreManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Eye, Edit, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import StatusBar from '@/components/ui/status-bar';
import TipTapEditor, { TipTapEditorRef } from '@/components/ui/tiptap-editor';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function Home() {
  const { 
    getCurrentNote, 
    updateNote, 
    setCurrentNote,
    deleteNote
  } = useAppStoreManager();
  
  const { 
    isFocusMode, 
    setFocusMode 
  } = useUIStore();
  
  const currentNote = getCurrentNote();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Estado para controlar o modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Ref para o editor TipTap principal
  const editorRef = useRef<TipTapEditorRef>(null);
  // Ref para o editor TipTap do modo foco
  const focusEditorRef = useRef<TipTapEditorRef>(null);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setHasChanges(false);
      
              // Se é uma nota nova (sem título e conteúdo), focar no editor
        const isNewNote = !currentNote.title && !currentNote.content;
        if (isNewNote) {
          // Focar no editor após um delay para garantir que o componente foi renderizado
          setTimeout(() => {
            const activeEditor = isFocusMode ? focusEditorRef.current : editorRef.current;
            if (activeEditor) {
              activeEditor.focus();
            }
          }, 200);
        }
      
      // Garantir que updatedAt seja uma data válida
      const updatedAtDate = currentNote.updatedAt instanceof Date 
        ? currentNote.updatedAt 
        : new Date(currentNote.updatedAt);
      setLastSaved(isNaN(updatedAtDate.getTime()) ? new Date() : updatedAtDate);
    }
  }, [currentNote, isFocusMode]);

  const handleSave = async () => {
    if (currentNote && hasChanges) {
      try {
        // Se não tem título, criar um título padrão baseado na data
        const finalTitle = title.trim() || `Nota ${new Date().toLocaleString('pt-BR')}`;
        await updateNote(currentNote.id, { title: finalTitle, content });
        setTitle(finalTitle); // Atualizar o estado local também
        setHasChanges(false);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  const handleDelete = () => {
    if (!currentNote) return;
    setShowDeleteModal(true);
  };

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    if (!currentNote) return;
    
    try {
      await deleteNote(currentNote.id);
      setCurrentNote(null); // Remove a nota atual da visualização
      setFocusMode(false); // Sai do modo foco se a nota for deletada
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erro ao apagar a nota. Tente novamente.');
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const toggleFocusMode = () => {
    setFocusMode(!isFocusMode);
  };



  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, title, content]);



  const editorContent = (
    <div className="h-full flex flex-col">
      {/* Editor Header - Mantém fixo no topo */}
      <div className="border-b border-border bg-background p-4 flex items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Título da nota..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="border-none text-lg font-semibold p-0 focus-visible:ring-0"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFocusMode}
            title={isFocusMode ? 'Sair do modo foco' : 'Entrar em modo foco'}
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFocusMode ? 'Sair do Foco' : 'Foco'}
          </Button>

          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area - Scrollbar na lateral direita */}
      <div className="flex-1 overflow-y-auto notion-scrollbar py-6">
        <div className="flex items-start justify-center min-h-full">
          <div className="w-full max-w-4xl">
            <TipTapEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Escreva sua nota..."
              className="h-full w-full border-none resize-none focus-visible:ring-0"
              ref={editorRef}

            />
          </div>
        </div>
      </div>

      {/* Barra de Status - na área do editor */}
      <StatusBar 
        content={content}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
      />
    </div>
  );

  if (!currentNote) {
    return (
      <AppLayout>
        <div className="h-full p-6 flex items-center justify-center">
          <div className="max-w-md p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Bem-vindo ao Notas App
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Crie e gerencie suas notas em Markdown de forma simples e eficiente. 
                Todas as suas notas ficam salvas localmente no seu navegador.
              </p>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Clique em "Nova Nota" para começar
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Se estiver em modo foco, renderiza apenas o editor sem o AppLayout
  if (isFocusMode) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header simplificado para modo foco */}
        <div className="border-b border-border bg-background p-4 flex items-center justify-between">
          <div className="flex-1">
            <Input
              placeholder="Título da nota..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="border-none text-lg font-semibold p-0 focus-visible:ring-0"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFocusMode}
              title="Sair do modo foco"
            >
              <Minimize2 className="h-4 w-4" />
              Sair do Foco
            </Button>

            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar
            </Button>
          </div>
        </div>

        {/* Editor/Preview Area - Modo Foco com Scrollbar na lateral direita */}
        <div className="flex-1 overflow-y-auto notion-scrollbar py-8">
          <div className="flex items-start justify-center min-h-full">
            <div className="w-full max-w-5xl">
              <TipTapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Escreva sua nota..."
                className="h-full w-full border-none resize-none focus-visible:ring-0"
                ref={focusEditorRef}
                
              />
            </div>
          </div>
        </div>

        {/* Status bar no modo foco */}
        <StatusBar 
          content={content}
          lastSaved={lastSaved}
          hasChanges={hasChanges}
        />

        {/* Modal de Confirmação - Modo Foco */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Apagar Nota"
          message={`Tem certeza que deseja apagar a nota "${currentNote?.title || 'Nota sem título'}"?\n\nEsta ação não pode ser desfeita.`}
          confirmText="Apagar"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    );
  }

  // Renderização normal com sidebar
  return (
    <AppLayout>
      {editorContent}
      
      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Apagar Nota"
        message={`Tem certeza que deseja apagar a nota "${currentNote?.title || 'Nota sem título'}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Apagar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </AppLayout>
  );
}
