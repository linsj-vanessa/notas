'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { Note } from '@/types/note';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';

interface DiagnosticResult {
  totalNotes: number;
  activeNotes: number;
  trashedNotes: number;
  problematicNotes: {
    note: Note;
    problems: string[];
  }[];
}

export default function MigrationDiagnostics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
      const activeNotes = allNotes.filter(note => !note.isDeleted);
      const trashedNotes = allNotes.filter(note => note.isDeleted);
      const problematicNotes: { note: Note; problems: string[] }[] = [];

      // Analisar cada nota
      for (const note of allNotes) {
        const problems: string[] = [];

        // Verificar tipos
        if (typeof note.id !== 'string') {
          problems.push(`ID inválido: ${typeof note.id}`);
        }

        if (typeof note.title !== 'string') {
          problems.push(`Título inválido: ${typeof note.title}`);
        }

        if (typeof note.content !== 'string') {
          problems.push(`Conteúdo inválido: ${typeof note.content}`);
        }

        if (!Array.isArray(note.tags)) {
          problems.push(`Tags inválidas: ${typeof note.tags}`);
        }

        if (!(note.createdAt instanceof Date)) {
          problems.push(`Data de criação inválida: ${typeof note.createdAt}`);
        }

        if (!(note.updatedAt instanceof Date)) {
          problems.push(`Data de atualização inválida: ${typeof note.updatedAt}`);
        }

        if (note.deletedAt && !(note.deletedAt instanceof Date)) {
          problems.push(`Data de exclusão inválida: ${typeof note.deletedAt}`);
        }

        // Tentar converter para markdown
        try {
          const markdown = markdownConverter.toMarkdown(note);
          
          // Tentar converter de volta
          try {
            const convertedNote = markdownConverter.fromMarkdown(markdown);
            
            // Verificar se a conversão foi bem-sucedida
            if (convertedNote.id !== note.id) {
              problems.push('ID perdido na conversão');
            }
            
            if (convertedNote.title !== note.title) {
              problems.push('Título modificado na conversão');
            }
          } catch (error) {
            problems.push(`Erro na conversão de volta: ${(error as Error).message}`);
          }
        } catch (error) {
          problems.push(`Erro na conversão para markdown: ${(error as Error).message}`);
        }

        if (problems.length > 0) {
          problematicNotes.push({ note, problems });
        }
      }

      setResults({
        totalNotes: allNotes.length,
        activeNotes: activeNotes.length,
        trashedNotes: trashedNotes.length,
        problematicNotes
      });

    } catch (error) {
      console.error('Erro durante análise:', error);
      alert(`Erro durante análise: ${(error as Error).message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportProblematicData = () => {
    if (!results) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalNotes: results.totalNotes,
        activeNotes: results.activeNotes,
        trashedNotes: results.trashedNotes,
        problematicNotes: results.problematicNotes.length
      },
      problematicNotes: results.problematicNotes.map(({ note, problems }) => ({
        note: {
          id: note.id,
          title: note.title,
          content: note.content?.substring(0, 100) + '...',
          tags: note.tags,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          isDeleted: note.isDeleted,
          deletedAt: note.deletedAt
        },
        problems
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-migracao-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Migração</CardTitle>
          <CardDescription>
            Analise os dados do IndexedDB para identificar problemas antes da migração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={analyzeData}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar Dados'}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.totalNotes}</div>
                    <div className="text-sm text-gray-600">Total de Notas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.activeNotes}</div>
                    <div className="text-sm text-gray-600">Notas Ativas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{results.trashedNotes}</div>
                    <div className="text-sm text-gray-600">Na Lixeira</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{results.problematicNotes.length}</div>
                    <div className="text-sm text-gray-600">Problemáticas</div>
                  </div>
                </div>

                {results.problematicNotes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Notas Problemáticas</h3>
                      <Button onClick={exportProblematicData} variant="outline">
                        Exportar Dados
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {results.problematicNotes.map(({ note, problems }, index) => (
                        <div key={index} className="border border-red-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-red-800">
                                {typeof note.title === 'string' ? note.title : `[Título inválido: ${typeof note.title}]`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                ID: {typeof note.id === 'string' ? note.id : `[ID inválido: ${typeof note.id}]`}
                              </p>
                              <div className="mt-2">
                                <p className="text-sm font-medium text-red-700">Problemas:</p>
                                <ul className="text-sm text-red-600 list-disc list-inside">
                                  {problems.map((problem, i) => (
                                    <li key={i}>{problem}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <Button
                              onClick={() => setSelectedNote(note)}
                              variant="outline"
                              size="sm"
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.problematicNotes.length === 0 && (
                  <div className="text-center p-8 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">
                      ✅ Nenhum problema detectado!
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Seus dados parecem estar em boa forma para migração.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedNote && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Nota</CardTitle>
            <CardDescription>
              Dados brutos da nota selecionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => setSelectedNote(null)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
              
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(selectedNote, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 