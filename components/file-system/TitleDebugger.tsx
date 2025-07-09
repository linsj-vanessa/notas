'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { Note } from '@/types/note';
import { markdownConverter } from '@/lib/file-system/MarkdownConverter';

interface ConversionStep {
  step: string;
  title: string;
  details?: string;
}

export default function TitleDebugger() {
  const [noteId, setNoteId] = useState('7599c4e6-abee-4e11-a154-a7d1acc976af');
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  const debugConversion = async () => {
    setIsDebugging(true);
    setConversionSteps([]);
    setMarkdownContent('');

    // Ativar modo de depuração
    markdownConverter.setDebugMode(true);

    try {
      // Buscar nota original
      const note = await db.notes.get(noteId);
      if (!note) {
        alert('Nota não encontrada');
        return;
      }

      setOriginalNote(note);
      const steps: ConversionStep[] = [];

      // Passo 1: Título original
      steps.push({
        step: '1. Título Original',
        title: note.title,
        details: `Tipo: ${typeof note.title}, Comprimento: ${note.title?.length || 0}`
      });

      // Passo 2: Conversão para Markdown
      let markdown: string;
      try {
        markdown = markdownConverter.toMarkdown(note);
        setMarkdownContent(markdown);
        
        // Extrair título do frontmatter
        const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1];
          const titleMatch = frontmatterText.match(/title:\s*(.+)$/m);
          if (titleMatch) {
            const titleInFrontmatter = titleMatch[1].replace(/^["']|["']$/g, '');
            steps.push({
              step: '2. Título no Frontmatter',
              title: titleInFrontmatter,
              details: `Extraído do YAML: "${titleMatch[1]}"`
            });
          }
        }

        // Extrair título H1 do conteúdo
        const h1Match = markdown.match(/^# (.+)$/m);
        if (h1Match) {
          steps.push({
            step: '3. Título H1 no Conteúdo',
            title: h1Match[1],
            details: `Extraído do H1: "${h1Match[0]}"`
          });
        }

      } catch (error) {
        steps.push({
          step: '2. ERRO na Conversão para Markdown',
          title: 'ERRO',
          details: (error as Error).message
        });
        setConversionSteps(steps);
        return;
      }

      // Passo 3: Conversão de volta para Note
      try {
        const convertedNote = markdownConverter.fromMarkdown(markdown);
        
        steps.push({
          step: '4. Título Após Conversão',
          title: convertedNote.title,
          details: `Tipo: ${typeof convertedNote.title}, Comprimento: ${convertedNote.title?.length || 0}`
        });

        // Comparar
        const isEqual = note.title === convertedNote.title;
        steps.push({
          step: '5. Comparação',
          title: isEqual ? '✅ IGUAL' : '❌ DIFERENTE',
          details: isEqual ? 
            'Títulos são idênticos' : 
            `Original: "${note.title}" vs Convertido: "${convertedNote.title}"`
        });

        // Análise detalhada se diferentes
        if (!isEqual) {
          steps.push({
            step: '6. Análise Detalhada',
            title: 'Diferenças Encontradas',
            details: `
              Original (${note.title.length} chars): [${note.title.split('').map(c => c.charCodeAt(0)).join(', ')}]
              Convertido (${convertedNote.title.length} chars): [${convertedNote.title.split('').map(c => c.charCodeAt(0)).join(', ')}]
            `
          });
        }

      } catch (error) {
        steps.push({
          step: '4. ERRO na Conversão de Volta',
          title: 'ERRO',
          details: (error as Error).message
        });
      }

      setConversionSteps(steps);

    } catch (error) {
      alert(`Erro durante depuração: ${(error as Error).message}`);
    } finally {
      // Desativar modo de depuração
      markdownConverter.setDebugMode(false);
      setIsDebugging(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Depurador de Conversão de Títulos</CardTitle>
          <CardDescription>
            Analise problemas específicos na conversão de títulos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="ID da nota"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={debugConversion}
                disabled={isDebugging || !noteId.trim()}
              >
                {isDebugging ? 'Depurando...' : 'Depurar Conversão'}
              </Button>
            </div>

            {originalNote && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Nota Original</h3>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {originalNote.id}<br/>
                  <strong>Título:</strong> "{originalNote.title}"<br/>
                  <strong>Criada:</strong> {originalNote.createdAt.toLocaleString()}<br/>
                  <strong>Atualizada:</strong> {originalNote.updatedAt.toLocaleString()}
                </p>
              </div>
            )}

            {conversionSteps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Passos da Conversão</h3>
                {conversionSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      step.title.includes('ERRO') ? 'border-red-200 bg-red-50' :
                      step.title.includes('DIFERENTE') ? 'border-yellow-200 bg-yellow-50' :
                      step.title.includes('IGUAL') ? 'border-green-200 bg-green-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium">{step.step}</h4>
                    <p className="text-lg font-mono">{step.title}</p>
                    {step.details && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{step.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {markdownContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Markdown Gerado</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {markdownContent}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 