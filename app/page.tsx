'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useNotesStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Eye, Edit, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import StatusBar from '@/components/ui/status-bar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const { 
    currentNote, 
    updateNote, 
    deleteNote, 
    setCurrentNote, 
    isFocusMode, 
    setFocusMode 
  } = useNotesStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setHasChanges(false);
      // Garantir que updatedAt seja uma data válida
      const updatedAtDate = currentNote.updatedAt instanceof Date 
        ? currentNote.updatedAt 
        : new Date(currentNote.updatedAt);
      setLastSaved(isNaN(updatedAtDate.getTime()) ? new Date() : updatedAtDate);
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (currentNote && hasChanges) {
      try {
        await updateNote(currentNote.id, { title, content });
        setHasChanges(false);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!currentNote) return;
    
    const confirmed = confirm(
      `Tem certeza que deseja apagar a nota "${currentNote.title || 'Nota sem título'}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmed) {
      try {
        await deleteNote(currentNote.id);
        setCurrentNote(null); // Remove a nota atual da visualização
        setFocusMode(false); // Sai do modo foco se a nota for deletada
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Erro ao apagar a nota. Tente novamente.');
      }
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? 'Editar' : 'Visualizar'}
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

      {/* Editor/Preview Area - Scroll no canto esquerdo */}
      <div className="flex-1 overflow-hidden py-6 flex items-start justify-center">
        <div className="w-full max-w-4xl h-full overflow-y-auto notion-scrollbar">
          {isPreviewMode ? (
            <div className="px-8">
              <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-foreground">{children}</li>,
                    code: ({children, className}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                          <code className="text-sm font-mono text-foreground">{children}</code>
                        </pre>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
                      );
                    },
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic mb-4 text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                    a: ({children, href}) => (
                      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-border">{children}</table>
                      </div>
                    ),
                    th: ({children}) => (
                      <th className="border border-border bg-muted p-2 text-left font-semibold">{children}</th>
                    ),
                    td: ({children}) => (
                      <td className="border border-border p-2">{children}</td>
                    ),
                  }}
                >
                  {content || '*Nota vazia*'}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <Textarea
              placeholder="Escreva sua nota em Markdown..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="h-full w-full border-none resize-none focus-visible:ring-0 px-8 py-0 font-mono text-sm leading-relaxed bg-transparent overflow-hidden"
            />
          )}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? 'Editar' : 'Visualizar'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Área principal centralizada */}
        <div className="flex-1 overflow-hidden py-8 flex items-start justify-center">
          <div className="w-full max-w-5xl h-full overflow-y-auto notion-scrollbar">
            {isPreviewMode ? (
              <div className="px-12">
                <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold mb-4 text-foreground">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold mb-3 text-foreground">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium mb-2 text-foreground">{children}</h3>,
                      p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-foreground">{children}</li>,
                      code: ({children, className}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                            <code className="text-sm font-mono text-foreground">{children}</code>
                          </pre>
                        ) : (
                          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
                        );
                      },
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic mb-4 text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      hr: () => <hr className="my-6 border-border" />,
                      a: ({children, href}) => (
                        <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      table: ({children}) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="min-w-full border border-border">{children}</table>
                        </div>
                      ),
                      th: ({children}) => (
                        <th className="border border-border bg-muted p-2 text-left font-semibold">{children}</th>
                      ),
                      td: ({children}) => (
                        <td className="border border-border p-2">{children}</td>
                      ),
                    }}
                  >
                    {content || '*Nota vazia*'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <Textarea
                placeholder="Escreva sua nota em Markdown..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="h-full w-full border-none resize-none focus-visible:ring-0 px-12 py-0 font-mono text-sm leading-relaxed bg-transparent overflow-hidden"
              />
            )}
          </div>
        </div>

        {/* Status bar no modo foco */}
        <StatusBar 
          content={content}
          lastSaved={lastSaved}
          hasChanges={hasChanges}
        />
      </div>
    );
  }

  // Renderização normal com sidebar
  return (
    <AppLayout>
      {editorContent}
    </AppLayout>
  );
}
