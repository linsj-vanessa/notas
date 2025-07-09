'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getFileSystemService } from '@/lib/file-system/FileSystemService';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';
import { Note, CreateNoteData } from '@/types/note';
import { FileSystemBrowserSupport } from '@/lib/file-system/types';

export default function FileSystemTest() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [supportInfo, setSupportInfo] = useState<FileSystemBrowserSupport | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileSystemService = getFileSystemService();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkSupport = () => {
    const support = fileSystemService.getBrowserSupport();
    setSupportInfo(support);
    
    if (support.hasFileSystemAccess) {
      addTestResult('✅ File System Access API é suportado');
    } else {
      addTestResult(`❌ File System Access API não é suportado. Navegador: ${support.browserName} ${support.browserVersion}`);
      addTestResult(`🔄 Modo fallback: ${support.fallbackMode}`);
    }
  };

  const selectDirectory = async () => {
    try {
      setIsLoading(true);
      const handle = await fileSystemService.selectDirectory();
      setDirectoryHandle(handle);
      addTestResult(`✅ Diretório selecionado: ${handle.name}`);
      
      // Inicializar estrutura de diretórios
      const structure = await fileSystemService.initializeDirectoryStructure(handle);
      addTestResult(`✅ Estrutura de diretórios criada`);
      addTestResult(`  - Notas: ${structure.notesDir.name}`);
      addTestResult(`  - Metadata: ${structure.metadataDir.name}`);
      addTestResult(`  - Lixeira: ${structure.trashDir.name}`);
    } catch (error: any) {
      addTestResult(`❌ Erro ao selecionar diretório: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestNote = async () => {
    if (!directoryHandle) {
      addTestResult('❌ Selecione um diretório primeiro');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar dados de teste
      const testData: CreateNoteData = {
        title: 'Nota de Teste',
        content: 'Este é um **teste** do sistema de arquivos local.\n\n- Item 1\n- Item 2\n- Item 3',
        tags: ['teste', 'file-system', 'markdown']
      };

      // Converter para markdown
      const { note, markdown } = markdownConverter.createNoteToMarkdown(testData);
      addTestResult(`✅ Nota convertida para markdown`);

      // Gerar nome do arquivo
      const fileName = markdownConverter.generateFileName(note.title);
      addTestResult(`✅ Nome do arquivo: ${fileName}`);

      // Criar arquivo
      const fileHandle = await fileSystemService.getFileHandle(directoryHandle, fileName, true);
      await fileSystemService.writeFile(fileHandle, markdown);
      addTestResult(`✅ Arquivo criado: ${fileName}`);

      // Testar leitura
      const readContent = await fileSystemService.readFile(fileHandle);
      const parsedNote = markdownConverter.fromMarkdown(readContent);
      addTestResult(`✅ Arquivo lido e convertido de volta`);
      addTestResult(`  - Título: ${parsedNote.title}`);
      addTestResult(`  - Tags: ${parsedNote.tags?.join(', ') || 'Nenhuma'}`);
      addTestResult(`  - ID: ${parsedNote.id}`);

    } catch (error: any) {
      addTestResult(`❌ Erro ao criar nota de teste: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listFiles = async () => {
    if (!directoryHandle) {
      addTestResult('❌ Selecione um diretório primeiro');
      return;
    }

    try {
      setIsLoading(true);
      const files = await fileSystemService.listFiles(directoryHandle);
      addTestResult(`✅ Arquivos encontrados: ${files.length}`);
      
      for (const file of files) {
        const metadata = await fileSystemService.getFileMetadata(file);
        addTestResult(`  - ${file.name} (${metadata.size} bytes, ${metadata.lastModified.toLocaleString()})`);
      }
    } catch (error: any) {
      addTestResult(`❌ Erro ao listar arquivos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMarkdownConversion = () => {
    try {
      // Teste de conversão
      const testNote: Note = {
        id: 'test-123',
        title: 'Teste de Conversão',
        content: 'Conteúdo de **teste** com markdown.',
        tags: ['teste', 'conversão'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false
      };

      const markdown = markdownConverter.toMarkdown(testNote);
      addTestResult(`✅ Conversão para markdown:`);
      addTestResult(`\n${markdown}`);

      const parsedBack = markdownConverter.fromMarkdown(markdown);
      addTestResult(`✅ Conversão de volta para JSON:`);
      addTestResult(`  - Título: ${parsedBack.title}`);
      addTestResult(`  - Tags: ${parsedBack.tags?.join(', ') || 'Nenhuma'}`);
      addTestResult(`  - ID: ${parsedBack.id}`);

      // Teste de validação
      const validation = markdownConverter.validateMarkdown(markdown);
      addTestResult(`✅ Validação: ${validation.isValid ? 'Válido' : 'Inválido'}`);
      if (!validation.isValid) {
        addTestResult(`❌ Erro de validação: ${validation.error}`);
      }

    } catch (error: any) {
      addTestResult(`❌ Erro no teste de conversão: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teste do Sistema de Arquivos</h1>
        <Button onClick={clearResults} variant="outline">
          Limpar Resultados
        </Button>
      </div>

      {/* Informações de Suporte */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Compatibilidade do Navegador</h2>
        <div className="space-y-2">
          <Button onClick={checkSupport} disabled={isLoading}>
            Verificar Suporte
          </Button>
          
          {supportInfo && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p><strong>Navegador:</strong> {supportInfo.browserName} {supportInfo.browserVersion}</p>
              <p><strong>File System Access:</strong> {supportInfo.hasFileSystemAccess ? '✅ Suportado' : '❌ Não suportado'}</p>
              <p><strong>Directory Picker:</strong> {supportInfo.hasDirectoryPicker ? '✅ Suportado' : '❌ Não suportado'}</p>
              <p><strong>File Picker:</strong> {supportInfo.hasFilePicker ? '✅ Suportado' : '❌ Não suportado'}</p>
              <p><strong>Modo Fallback:</strong> {supportInfo.fallbackMode}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Testes de Arquivo */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Testes de Arquivo</h2>
        <div className="space-x-2 space-y-2">
          <Button onClick={selectDirectory} disabled={isLoading}>
            Selecionar Diretório
          </Button>
          
          <Button onClick={createTestNote} disabled={isLoading || !directoryHandle}>
            Criar Nota de Teste
          </Button>
          
          <Button onClick={listFiles} disabled={isLoading || !directoryHandle}>
            Listar Arquivos
          </Button>
          
          <Button onClick={testMarkdownConversion} disabled={isLoading}>
            Testar Conversão Markdown
          </Button>
        </div>
        
        {directoryHandle && (
          <div className="mt-3 p-3 bg-green-50 rounded">
            <p><strong>Diretório atual:</strong> {directoryHandle.name}</p>
          </div>
        )}
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