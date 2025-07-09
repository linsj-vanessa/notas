'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFileNotesStore } from '@/lib/stores/fileNotesStore';
import { CreateNoteData, UpdateNoteData } from '@/types/note';

export default function FileNotesStoreTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testNoteTitle, setTestNoteTitle] = useState('Nota de Teste do Store');
  const [testNoteContent, setTestNoteContent] = useState('Conteúdo de **teste** do novo store de arquivos locais.');

  const {
    directoryHandle,
    isFileSystemEnabled,
    isLoading,
    error,
    notes,
    trashNotes,
    currentNote,
    lastSync,
    
    setDirectoryHandle,
    initializeFileSystem,
    loadNotesFromFiles,
    createNote,
    updateNote,
    deleteNote,
    moveToTrash,
    restoreFromTrash,
    syncWithFileSystem,
    setCurrentNote,
    getFilteredNotes,
    clearError,
  } = useFileNotesStore();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const selectDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      addTestResult(`✅ Diretório selecionado: ${handle.name}`);
    } catch (error) {
      addTestResult(`❌ Erro ao selecionar diretório: ${(error as Error).message}`);
    }
  };

  const initializeSystem = async () => {
    try {
      await initializeFileSystem();
      addTestResult('✅ Sistema de arquivos inicializado com sucesso');
    } catch (error) {
      addTestResult(`❌ Erro ao inicializar: ${(error as Error).message}`);
    }
  };

  const loadNotes = async () => {
    try {
      await loadNotesFromFiles();
      addTestResult(`✅ Notas carregadas: ${notes.length} ativas, ${trashNotes.length} na lixeira`);
    } catch (error) {
      addTestResult(`❌ Erro ao carregar notas: ${(error as Error).message}`);
    }
  };

  const createTestNote = async () => {
    try {
      const data: CreateNoteData = {
        title: testNoteTitle,
        content: testNoteContent,
        tags: ['teste', 'store', 'file-system']
      };
      
      const note = await createNote(data);
      addTestResult(`✅ Nota criada: ${note.title} (ID: ${note.id})`);
    } catch (error) {
      addTestResult(`❌ Erro ao criar nota: ${(error as Error).message}`);
    }
  };

  const updateCurrentNote = async () => {
    if (!currentNote) {
      addTestResult('❌ Nenhuma nota selecionada');
      return;
    }

    try {
      const data: UpdateNoteData = {
        title: `${currentNote.title} - Atualizada`,
        content: `${currentNote.content}\n\n**Atualização:** ${new Date().toLocaleString()}`,
        tags: [...(currentNote.tags || []), 'atualizada']
      };
      
      await updateNote(currentNote.id, data);
      addTestResult(`✅ Nota atualizada: ${currentNote.id}`);
    } catch (error) {
      addTestResult(`❌ Erro ao atualizar nota: ${(error as Error).message}`);
    }
  };

  const deleteCurrentNote = async () => {
    if (!currentNote) {
      addTestResult('❌ Nenhuma nota selecionada');
      return;
    }

    try {
      await deleteNote(currentNote.id);
      addTestResult(`✅ Nota movida para lixeira: ${currentNote.id}`);
    } catch (error) {
      addTestResult(`❌ Erro ao deletar nota: ${(error as Error).message}`);
    }
  };

  const restoreFirstTrashNote = async () => {
    if (trashNotes.length === 0) {
      addTestResult('❌ Nenhuma nota na lixeira');
      return;
    }

    try {
      const note = trashNotes[0];
      await restoreFromTrash(note.id);
      addTestResult(`✅ Nota restaurada: ${note.title}`);
    } catch (error) {
      addTestResult(`❌ Erro ao restaurar nota: ${(error as Error).message}`);
    }
  };

  const syncNotes = async () => {
    try {
      await syncWithFileSystem();
      addTestResult('✅ Sincronização concluída');
    } catch (error) {
      addTestResult(`❌ Erro na sincronização: ${(error as Error).message}`);
    }
  };

  const testSearch = () => {
    const searchTerm = 'teste';
    const filtered = getFilteredNotes(searchTerm);
    addTestResult(`✅ Busca por "${searchTerm}": ${filtered.length} resultados`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teste do Store de Notas com Arquivos</h1>
        <Button onClick={clearResults} variant="outline">
          Limpar Resultados
        </Button>
      </div>

      {/* Estado Atual */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Estado Atual</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Diretório:</strong> {directoryHandle?.name || 'Não selecionado'}</p>
            <p><strong>Sistema habilitado:</strong> {isFileSystemEnabled ? '✅' : '❌'}</p>
            <p><strong>Carregando:</strong> {isLoading ? '⏳' : '✅'}</p>
            <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
          </div>
          <div>
            <p><strong>Notas ativas:</strong> {notes.length}</p>
            <p><strong>Notas na lixeira:</strong> {trashNotes.length}</p>
            <p><strong>Nota atual:</strong> {currentNote?.title || 'Nenhuma'}</p>
            <p><strong>Última sincronização:</strong> {lastSync?.toLocaleString() || 'Nunca'}</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded">
            <p className="text-red-600">{error}</p>
            <Button onClick={clearError} size="sm" className="mt-2">
              Limpar Erro
            </Button>
          </div>
        )}
      </Card>

      {/* Configuração de Teste */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Configuração de Teste</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Título da Nota:</label>
            <input
              type="text"
              value={testNoteTitle}
              onChange={(e) => setTestNoteTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo da Nota:</label>
            <textarea
              value={testNoteContent}
              onChange={(e) => setTestNoteContent(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Controles */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Controles</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={selectDirectory} disabled={isLoading}>
            Selecionar Diretório
          </Button>
          <Button onClick={initializeSystem} disabled={!directoryHandle || isLoading}>
            Inicializar Sistema
          </Button>
          <Button onClick={loadNotes} disabled={!isFileSystemEnabled || isLoading}>
            Carregar Notas
          </Button>
          <Button onClick={createTestNote} disabled={!isFileSystemEnabled || isLoading}>
            Criar Nota de Teste
          </Button>
          <Button onClick={updateCurrentNote} disabled={!currentNote || isLoading}>
            Atualizar Nota Atual
          </Button>
          <Button onClick={deleteCurrentNote} disabled={!currentNote || isLoading}>
            Deletar Nota Atual
          </Button>
          <Button onClick={restoreFirstTrashNote} disabled={trashNotes.length === 0 || isLoading}>
            Restaurar da Lixeira
          </Button>
          <Button onClick={syncNotes} disabled={!isFileSystemEnabled || isLoading}>
            Sincronizar
          </Button>
          <Button onClick={testSearch} disabled={notes.length === 0}>
            Testar Busca
          </Button>
        </div>
      </Card>

      {/* Lista de Notas */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Notas ({notes.length})</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 border rounded cursor-pointer ${
                currentNote?.id === note.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentNote(note)}
            >
              <div className="font-medium">{note.title}</div>
              <div className="text-sm text-gray-600">
                {note.tags?.join(', ') || 'Sem tags'} • {note.updatedAt.toLocaleString()}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-gray-500 italic text-center py-4">
              Nenhuma nota encontrada
            </div>
          )}
        </div>
      </Card>

      {/* Lixeira */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Lixeira ({trashNotes.length})</h2>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {trashNotes.map((note) => (
            <div key={note.id} className="p-2 border rounded bg-red-50">
              <div className="font-medium">{note.title}</div>
              <div className="text-sm text-gray-600">
                Deletada em: {note.deletedAt?.toLocaleString()}
              </div>
            </div>
          ))}
          {trashNotes.length === 0 && (
            <div className="text-gray-500 italic text-center py-2">
              Lixeira vazia
            </div>
          )}
        </div>
      </Card>

      {/* Resultados */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Resultados dos Testes</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum teste executado ainda.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-gray-50 rounded">
                {result}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 